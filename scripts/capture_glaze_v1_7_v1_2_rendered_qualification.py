#!/usr/bin/env python3
"""Capture exact-source Glaze V1.7 retained-v1.2 rendered-browser qualification evidence."""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import shutil
import struct
import subprocess
import sys
import time
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

HOST="127.0.0.1"
WEB_PORT=8817
DRIVER_PORT=9567
SERVER=f"http://{HOST}:{WEB_PORT}"
DRIVER=f"http://{HOST}:{DRIVER_PORT}"
SOURCE_REVISION="4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL_VERSION="1.7.0-dev.47"\nACCEPTANCE_MODEL_VERSION="1.7.0-dev.39"

class QualificationError(RuntimeError):
    pass

def require(condition: bool, message: str) -> None:
    if not condition:
        raise QualificationError(message)

def load_json(path: Path) -> dict[str, Any]:
    require(path.is_file(), f"missing JSON file: {path}")
    value=json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value,dict), f"JSON root must be an object: {path}")
    return value

def webdriver_request(method: str, path: str, payload: dict[str, Any] | None=None, timeout: int=30) -> Any:
    request=Request(
        f"{DRIVER}{path}",
        data=None if payload is None else json.dumps(payload).encode("utf-8"),
        method=method,
        headers={"Content-Type":"application/json; charset=utf-8"},
    )
    try:
        with urlopen(request,timeout=timeout) as response:
            raw=response.read()
    except HTTPError as error:
        body=error.read().decode(errors="replace")
        raise QualificationError(f"WebDriver HTTP {error.code}: {body}") from error
    except (URLError,TimeoutError) as error:
        raise QualificationError(f"WebDriver request failed: {error}") from error
    if not raw:
        return None
    decoded=json.loads(raw.decode("utf-8"))
    value=decoded.get("value")
    if isinstance(value,dict) and value.get("error"):
        raise QualificationError(f"WebDriver {value.get('error')}: {value.get('message','')}")
    return value

def wait_http(url: str, seconds: float=15) -> None:
    end=time.monotonic()+seconds
    last: Exception | None=None
    while time.monotonic()<end:
        try:
            with urlopen(url,timeout=1) as response:
                if response.status==200:
                    return
        except Exception as error:
            last=error
        time.sleep(0.15)
    raise QualificationError(f"HTTP endpoint not ready: {last}")

def chromedriver() -> str:
    for item in (shutil.which("chromedriver"),"/usr/bin/chromedriver","/usr/local/share/chromedriver-linux64/chromedriver"):
        if item and Path(item).is_file():
            return str(item)
    raise QualificationError("chromedriver unavailable")

def wait_driver() -> None:
    end=time.monotonic()+15
    last: Exception | None=None
    while time.monotonic()<end:
        try:
            status=webdriver_request("GET","/status")
            if isinstance(status,dict) and status.get("ready"):
                return
        except Exception as error:
            last=error
        time.sleep(0.2)
    raise QualificationError(f"chromedriver not ready: {last}")

def create_session() -> str:
    value=webdriver_request("POST","/session",{
        "capabilities":{"alwaysMatch":{
            "browserName":"chrome",
            "goog:chromeOptions":{"args":[
                "--headless=new","--no-sandbox","--disable-dev-shm-usage",
                "--disable-background-networking","--disable-component-update",
                "--disable-default-apps","--disable-extensions","--disable-sync",
                "--metrics-recording-only","--no-first-run","--hide-scrollbars",
                "--window-size=1440,1200"
            ]}
        }}
    },timeout=60)
    require(isinstance(value,dict) and isinstance(value.get("sessionId"),str),"Chrome returned no session id")
    return value["sessionId"]

def execute(session_id: str, script: str) -> Any:
    return webdriver_request("POST",f"/session/{session_id}/execute/sync",{"script":script,"args":[]})

def cdp(session_id: str, command: str, params: dict[str, Any] | None=None) -> Any:
    return webdriver_request("POST",f"/session/{session_id}/goog/cdp/execute",{"cmd":command,"params":params or {}})

def set_viewport(session_id: str, width: int, height: int, mobile: bool) -> None:
    cdp(session_id,"Emulation.setDeviceMetricsOverride",{
        "width":width,"height":height,"deviceScaleFactor":1,"mobile":mobile,
        "screenWidth":width,"screenHeight":height
    })
    cdp(session_id,"Emulation.setTouchEmulationEnabled",{"enabled":mobile,"maxTouchPoints":5 if mobile else 1})

def set_media(session_id: str, features: list[dict[str,str]]) -> None:
    cdp(session_id,"Emulation.setEmulatedMedia",{"media":"screen","features":features})

def wait_ready(session_id: str, seconds: float=20) -> None:
    end=time.monotonic()+seconds
    last: Any=None
    while time.monotonic()<end:
        last=execute(session_id,"return document.readyState==='complete' && window.__glazeV17V12RenderedReady===true;")
        if last is True:
            return
        time.sleep(0.1)
    raise QualificationError(f"V1.7 rendered scene did not become ready: {last}")

def screenshot(session_id: str, path: Path) -> None:
    encoded=webdriver_request("GET",f"/session/{session_id}/screenshot")
    require(isinstance(encoded,str) and encoded,f"no screenshot bytes for {path.name}")
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(base64.b64decode(encoded))
    require(path.stat().st_size>3000,f"invalid screenshot: {path}")

def png_pixel_sha256(path: Path) -> str:
    data=path.read_bytes()
    require(data.startswith(b"\x89PNG\r\n\x1a\n"),f"not a PNG screenshot: {path}")
    offset=8
    width=height=bit_depth=color_type=interlace=None
    idat=bytearray()
    while offset<len(data):
        require(offset+12<=len(data),f"truncated PNG chunk: {path}")
        length=struct.unpack(">I",data[offset:offset+4])[0]
        kind=data[offset+4:offset+8]
        start=offset+8
        end=start+length
        require(end+4<=len(data),f"truncated PNG payload: {path}")
        payload=data[start:end]
        if kind==b"IHDR":
            width,height,bit_depth,color_type,compression,filter_method,interlace=struct.unpack(">IIBBBBB",payload)
            require(compression==0 and filter_method==0,f"unsupported PNG compression/filter: {path}")
        elif kind==b"IDAT":
            idat.extend(payload)
        elif kind==b"IEND":
            break
        offset=end+4
    require(width is not None and height is not None,f"PNG missing IHDR: {path}")
    require(bit_depth==8 and interlace==0,f"unsupported PNG bit depth/interlace: {path}")
    channels={0:1,2:3,4:2,6:4}.get(color_type)
    require(channels is not None,f"unsupported PNG color type {color_type}: {path}")
    stride=int(width)*int(channels)
    raw=zlib.decompress(bytes(idat))
    require(len(raw)==int(height)*(stride+1),f"unexpected PNG scanline size: {path}")
    decoded=bytearray()
    previous=bytearray(stride)
    cursor=0
    bpp=int(channels)
    def paeth(a:int,b:int,c:int)->int:
        p=a+b-c; pa=abs(p-a); pb=abs(p-b); pc=abs(p-c)
        if pa<=pb and pa<=pc:return a
        if pb<=pc:return b
        return c
    for _ in range(int(height)):
        filter_type=raw[cursor]; cursor+=1
        scan=bytearray(raw[cursor:cursor+stride]); cursor+=stride
        for i in range(stride):
            left=scan[i-bpp] if i>=bpp else 0
            up=previous[i]
            up_left=previous[i-bpp] if i>=bpp else 0
            if filter_type==1: scan[i]=(scan[i]+left)&0xFF
            elif filter_type==2: scan[i]=(scan[i]+up)&0xFF
            elif filter_type==3: scan[i]=(scan[i]+((left+up)//2))&0xFF
            elif filter_type==4: scan[i]=(scan[i]+paeth(left,up,up_left))&0xFF
            else: require(filter_type==0,f"unsupported PNG filter {filter_type}: {path}")
        decoded.extend(scan); previous=scan
    digest=hashlib.sha256()
    digest.update(struct.pack(">II",int(width),int(height)))
    digest.update(bytes([int(color_type),int(channels)]))
    digest.update(decoded)
    return digest.hexdigest()

def git_revision(root: Path) -> str:
    try:
        return subprocess.check_output(["git","rev-parse","HEAD"],cwd=root,text=True,stderr=subprocess.STDOUT).strip()
    except Exception as error:
        raise QualificationError(f"could not resolve git revision for {root}: {error}") from error

def git_clean(root: Path) -> bool:
    result=subprocess.run(["git","status","--porcelain","--untracked-files=no"],cwd=root,text=True,capture_output=True,check=False)
    require(result.returncode==0,f"could not inspect git status for {root}: {result.stderr}")
    return result.stdout.strip()==""

def freeze_for_capture(session_id: str) -> None:
    result=execute(session_id,"""
let style=document.getElementById('glz17-capture-freeze');
if(!style){
  style=document.createElement('style');
  style.id='glz17-capture-freeze';
  style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}';
  document.head.appendChild(style);
}
window.scrollTo(0,0);
void document.documentElement.offsetWidth;
return true;
""")
    require(result is True,"could not freeze V1.7 scene")
    execute(session_id,"return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))));")

def capture(render_root: Path, source_root: Path, tooling_root: Path, plan_path: Path, output: Path) -> dict[str,Any]:
    plan=load_json(plan_path)
    require(plan.get("sourceRevision")==SOURCE_REVISION,"rendered plan source revision drifted")
    require(plan.get("sourceModelVersion")==SOURCE_MODEL_VERSION,"rendered plan source model version drifted")\n    require(plan.get("acceptanceModelVersion")==ACCEPTANCE_MODEL_VERSION,"rendered plan acceptance model version drifted")
    require(plan.get("networkPolicy")=="repository-local-only","rendered plan network policy drifted")
    scenes=plan.get("scenes")
    require(isinstance(scenes,list) and len(scenes)==22,"rendered plan must contain exactly twenty-two scenes")

    require(git_revision(source_root)==SOURCE_REVISION,f"frozen source mismatch: expected {SOURCE_REVISION}")
    require(git_clean(source_root),"frozen V1.7 source has tracked modifications")
    tooling_revision=git_revision(tooling_root)
    harness=render_root/str(plan["harness"])
    require(harness.is_file(),f"render root missing harness: {harness}")
    require((render_root/"js/glaze-v1.7-development-v1-3.dev.mjs").is_file(),"render root missing frozen V1.7 aggregate")
    require((render_root/"css/glaze-v1.4.1.css").is_file(),"render root missing Stable CSS dependency")

    output.mkdir(parents=True,exist_ok=True)
    screenshots=output/"screenshots"
    scene_records=output/"scenes"
    captured=[]
    http=driver=None
    session_id: str | None=None
    try:
        http=subprocess.Popen([sys.executable,"-m","http.server",str(WEB_PORT),"--bind",HOST,"--directory",str(render_root)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        wait_http(f"{SERVER}/{plan['harness']}")
        driver=subprocess.Popen([chromedriver(),f"--port={DRIVER_PORT}","--allowed-ips=127.0.0.1"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        wait_driver()
        session_id=create_session()
        browser=cdp(session_id,"Browser.getVersion")

        for scene in scenes:
            scene_id=str(scene["id"])
            width,height=[int(v) for v in scene["viewport"]]
            mobile=bool(scene.get("mobile",False))
            set_viewport(session_id,width,height,mobile)
            set_media(session_id,list(scene.get("mediaFeatures",[])))
            query_args={"scene":scene_id,"revision":SOURCE_REVISION,"mode":str(scene["mode"])}
            if scene.get("profile"):
                query_args["profile"]=str(scene["profile"])
            if scene.get("posture"):
                query_args["posture"]=str(scene["posture"])
            query=urlencode(query_args)
            webdriver_request("POST",f"/session/{session_id}/url",{"url":f"{SERVER}/{plan['harness']}?{query}"})
            wait_ready(session_id)

            evidence=execute(session_id,"return window.__glazeV17V12RenderedEvidence;")
            require(isinstance(evidence,dict),f"scene produced no evidence object: {scene_id}")
            require(evidence.get("passed") is True,f"scene assertions failed: {scene_id}: {evidence.get('assertions')}")
            require(evidence.get("scene")==scene_id,f"scene identity mismatch: {scene_id}")
            require(evidence.get("sourceRevisionParameter")==SOURCE_REVISION,f"source binding failed: {scene_id}")
            require(evidence.get("aggregateVersion")==MODEL_VERSION,f"aggregate mismatch: {scene_id}")
            require(evidence.get("qualificationModelVersion")==MODEL_VERSION,f"qualification model mismatch: {scene_id}")
            require(evidence.get("stableBaseline")=="1.6.0",f"stable baseline mismatch: {scene_id}")
            authority=evidence.get("authority")
            require(isinstance(authority,dict) and authority.get("renderedBrowserOnly") is True,f"rendered authority missing: {scene_id}")
            for key in (
                "regressionBaselineClaimed","humanEvidenceClaimed","assistiveTechnologyEvidenceClaimed",
                "physicalDeviceEvidenceClaimed","nativePlatformEvidenceClaimed",
                "representativePerformanceEvidenceClaimed","energyEvidenceClaimed",
                "v12QualificationClaimed","section46CompleteClaimed","v17AcceptanceClaimed",
                "anchorStatusGranted","consumerEligibilityGranted","deploymentAcceptanceGranted",
                "productionAcceptanceGranted","lifecyclePromotionAutomatic"
            ):
                require(authority.get(key) is False,f"authority boundary drift for {scene_id}: {key}")

            dimensions=execute(session_id,"return [innerWidth,innerHeight,document.documentElement.scrollWidth,document.documentElement.scrollHeight];")
            require(isinstance(dimensions,list) and len(dimensions)==4,f"invalid viewport dimensions: {scene_id}")
            require(abs(int(dimensions[0])-width)<=1,f"viewport width drift: {scene_id}: {dimensions}")
            require(abs(int(dimensions[1])-height)<=1,f"viewport height drift: {scene_id}: {dimensions}")
            require(int(dimensions[2])<=width+1,f"horizontal overflow: {scene_id}: {dimensions}")

            scene_records.mkdir(parents=True,exist_ok=True)
            scene_json=scene_records/f"{scene_id}.json"
            scene_json.write_text(json.dumps(evidence,indent=2,sort_keys=True)+"\n",encoding="utf-8")
            freeze_for_capture(session_id)
            image=screenshots/f"{scene_id}.png"
            screenshot(session_id,image)
            captured.append({
                "id":scene_id,
                "laneIds":list(scene["laneIds"]),
                "viewport":[width,height],
                "mobile":mobile,
                "mode":scene["mode"],
                "mediaFeatures":list(scene.get("mediaFeatures",[])),
                "evidence":str(scene_json.relative_to(output)),
                "evidenceSha256":hashlib.sha256(scene_json.read_bytes()).hexdigest(),
                "screenshot":str(image.relative_to(output)),
                "screenshotSha256":hashlib.sha256(image.read_bytes()).hexdigest(),
                "pixelSha256":png_pixel_sha256(image),
                "passed":True
            })

        manifest={
            "schemaVersion":1,
            "recordType":"glaze-v1.7-v1.2-rendered-browser-capture",
            "lifecycle":"DevelopmentQualification",
            "sourceRevision":SOURCE_REVISION,
            "toolingRevision":tooling_revision,
            "sourceModelVersion":SOURCE_MODEL_VERSION,\n            "acceptanceModelVersion":ACCEPTANCE_MODEL_VERSION,
            "stableBaseline":"1.6.0",
            "observedAt":datetime.now(timezone.utc).isoformat().replace("+00:00","Z"),
            "browser":browser,
            "plan":str(plan_path.relative_to(tooling_root)),
            "planSha256":hashlib.sha256(plan_path.read_bytes()).hexdigest(),
            "harness":plan["harness"],
            "networkPolicy":plan["networkPolicy"],
            "renderedEvidenceLaneIds":list(plan["eligibleRenderedEvidenceLaneIds"]),\n            "openRenderedEvidenceLaneIds":list(plan.get("openRenderedEvidenceLaneIds",[])),
            "sceneCount":len(captured),
            "scenes":captured,
            "passed":all(scene["passed"] for scene in captured),
            "authority":dict(plan["authority"])
        }
        manifest_path=output/"manifest.json"
        manifest_path.write_text(json.dumps(manifest,indent=2,sort_keys=True)+"\n",encoding="utf-8")
        require(manifest["passed"] is True,"rendered capture manifest did not pass")

        evidence_records=[]
        seen=set()
        for captured_scene in captured:
            digest=captured_scene["evidenceSha256"]
            reference=f"evidence+sha256:{digest}:v1.7/v1.2-rendered/{captured_scene['id']}.json"
            for lane_id in captured_scene["laneIds"]:
                require(lane_id not in seen,f"rendered lane mapped by multiple scenes: {lane_id}")
                seen.add(lane_id)
                evidence_records.append({
                    "id":lane_id,
                    "verified":True,
                    "revision":SOURCE_REVISION,
                    "evidenceType":"rendered",
                    "reference":reference
                })
        require(sorted(seen)==sorted(plan["eligibleRenderedEvidenceLaneIds"]),"rendered evidence coverage drifted")
        evidence_path=output/"rendered-evidence.json"
        evidence_path.write_text(json.dumps(evidence_records,indent=2,sort_keys=True)+"\n",encoding="utf-8")
        manifest["evidenceRecord"]=str(evidence_path.relative_to(output))
        manifest["evidenceRecordSha256"]=hashlib.sha256(evidence_path.read_bytes()).hexdigest()
        manifest_path.write_text(json.dumps(manifest,indent=2,sort_keys=True)+"\n",encoding="utf-8")
        return manifest
    finally:
        if session_id:
            try: webdriver_request("DELETE",f"/session/{session_id}",timeout=5)
            except Exception: pass
        for process in (driver,http):
            if process:
                process.terminate()
                try: process.wait(timeout=5)
                except subprocess.TimeoutExpired: process.kill()

def parse_args() -> argparse.Namespace:
    parser=argparse.ArgumentParser()
    parser.add_argument("--render-root",required=True)
    parser.add_argument("--source-root",required=True)
    parser.add_argument("--tooling-root",default=".")
    parser.add_argument("--plan",default="contracts/v1.7/qualification.v1.2.rendered.plan.json")
    parser.add_argument("--out",default="artifacts/v1.7-v1.2-rendered")
    return parser.parse_args()

def main() -> None:
    args=parse_args()
    tooling_root=Path(args.tooling_root).resolve()
    source_root=Path(args.source_root).resolve()
    render_root=Path(args.render_root).resolve()
    plan_path=(tooling_root/args.plan).resolve()
    output=(tooling_root/args.out).resolve()
    manifest=capture(render_root,source_root,tooling_root,plan_path,output)
    print(f"Glaze V1.7 retained-v1.2 rendered-browser capture: PASS ({manifest['sceneCount']} scenes, source {manifest['sourceRevision']})")
    print("Boundary: 22 retained rendered groups only; rendered regression baseline, human, AT, device/native, performance/energy, acceptance, and lifecycle gates remain external.")

if __name__=="__main__":
    try:
        main()
    except QualificationError as error:
        print(f"Glaze V1.7 retained-v1.2 rendered-browser capture FAILED: {error}",file=sys.stderr)
        raise SystemExit(1)
