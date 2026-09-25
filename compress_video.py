import imageio_ffmpeg
import subprocess
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
input_video = r"C:\Users\sharj\mernstack\bitfix\kanary\restuarent_website\public\video\kanary web v1.mp4"
output_video = r"C:\Users\sharj\mernstack\bitfix\kanary\restuarent_website\public\video\kanary_web_v1.mp4"
temp_output = r"C:\Users\sharj\mernstack\bitfix\kanary\restuarent_website\public\video\kanary_web_v1_compressed.mp4"

print(f"FFmpeg executable: {ffmpeg_exe}")
print("Compressing video to under 30MB for Vercel deployment...")

cmd = [
    ffmpeg_exe, "-y",
    "-i", input_video,
    "-vcodec", "libx264",
    "-crf", "26",
    "-preset", "medium",
    "-acodec", "aac",
    "-b:a", "128k",
    temp_output
]

subprocess.run(cmd, check=True)

size_mb = os.path.getsize(temp_output) / (1024 * 1024)
print(f"Compression complete! New size: {size_mb:.2f} MB")

if size_mb < 45:
    if os.path.exists(output_video):
        os.remove(output_video)
    os.rename(temp_output, output_video)
    print("Successfully replaced kanary_web_v1.mp4 with compressed version!")
