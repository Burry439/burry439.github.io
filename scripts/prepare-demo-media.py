"""Export reviewed synthetic app sessions / gameplay. Requires ffmpeg and ffprobe.

Original captures stay in their project folders. Each cut is duration-checked;
public/demos/provenance.json records the source, crop, timestamps and output.
"""
import argparse, json, subprocess, pathlib

parser = argparse.ArgumentParser()
parser.add_argument('--sim-source', required=True, type=pathlib.Path)
parser.add_argument('--city-source', required=True, type=pathlib.Path)
args = parser.parse_args()
out = pathlib.Path('public/demos')
out.mkdir(parents=True, exist_ok=True)
records = []

def run(argv):
    return subprocess.check_output(argv, text=True).strip()

def duration(path):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(path)]))

def export(name, project, parts):
    root = args.sim_source if project == 'simreview' else args.city_source
    temp = []
    cuts = []
    for i, (source, start, end, crop) in enumerate(parts):
        path = root / 'public' / 'clips' / source
        actual = duration(path)
        if not 0 <= start < end <= actual:
            raise ValueError(f'{source}: {start}-{end} outside actual {actual}')
        dest = out / f'_{name}-{i}.mp4'
        filt = f'crop={crop},scale=1280:720' if crop else ('scale=1280:720' if project == 'the-city-beyond' else 'scale=624:-2')
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(start), '-i', str(path), '-t', str(end-start), '-an', '-vf', filt, '-r', '24', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dest)])
        temp.append(dest)
        cuts.append(dict(source=f'{project}/promo/public/clips/{source}', start=start, end=end, sourceDuration=actual, crop=crop))
    listing = out / f'_{name}.txt'
    listing.write_text('\n'.join(f"file '{p.name}'" for p in temp))
    dest = out / f'{name}.mp4'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(listing), '-c', 'copy', '-movflags', '+faststart', str(dest)])
    total = duration(dest)
    for kind, at in [('before', 0), ('after', max(0,total-.2))]:
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(at), '-i', str(dest), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88', str(out / f'{name}-{kind}.webp')])
    for p in temp: p.unlink()
    listing.unlink()
    records.append(dict(output=f'{name}.mp4', duration=total, bytes=dest.stat().st_size, silent=True, cuts=cuts))
    print(f'{name}: {total:.2f}s, {dest.stat().st_size/1e6:.2f}MB', flush=True)

export('sim-record', 'simreview', [('en-100-chest-pain-recording.mp4',0,5.8,None)])
export('sim-feedback', 'simreview', [('en-100-chest-pain-flow.mp4',1.34,4,None)])
export('sim-moment', 'simreview', [('en-100-chest-pain-flow.mp4',4,14.5,None)])
export('sim-focus', 'simreview', [('en-100-chest-pain-flow.mp4',22.0,23.1,None)])
export('sim-hebrew', 'simreview', [('he-100-ectopic-flow.mp4',.959,9.8,None)])
export('city-need', 'the-city-beyond', [('c_need.mp4',10.6,14.2,None)])
export('city-bronze', 'the-city-beyond', [('c_bronze.mp4',0,4.8,None)])
export('city-failure', 'the-city-beyond', [('c_bronze.mp4',12,14.2,None)])
export('city-iron', 'the-city-beyond', [('c_iron.mp4',17.6,20.8,None),('c_assembly.mp4',0,1.3,None),('c_assembly.mp4',16.9,22.2,None)])
export('city-proof', 'the-city-beyond', [('p_oren.mp4',8,12,None),('c_test.mp4',25.6,29.6,None)])
export('city-enter', 'the-city-beyond', [('p_admit.mp4',1.8,5.8,None),('p_gate.mp4',4.5,12.5,None)])

source = args.sim_source / 'public/shots/phone-case.png'
run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-vf', 'scale=624:-2', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88', str(out/'sim-case.webp')])
records.append(dict(output='sim-case.webp', source='simreview/promo/public/shots/phone-case.png', bytes=(out/'sim-case.webp').stat().st_size))
(out/'provenance.json').write_text(json.dumps(dict(description='Selected real UI captures. SimReview interviews are synthetic and AI voiced. Gameplay replays recorded outcomes. Silent exports; waiting time omitted.',exports=records), indent=2)+'\n', encoding='utf-8')
for prefix in ['sim-', 'city-']:
    size = sum(p.stat().st_size for p in out.glob(prefix+'*'))
    print(f'{prefix} all media and posters: {size/1e6:.2f}MB')
    if size > 8_000_000: raise ValueError(f'{prefix} exceeds 8MB budget')
