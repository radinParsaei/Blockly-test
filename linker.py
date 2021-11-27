import asyncio
import json
import os
import time

import websockets
import platform
import urllib.request

if platform.system() == "Windows":
    import ctypes

    if platform.machine().endswith('64'):
        def change_wallpaper(uri):
            uri = uri.replace("/", "\\")
            ctypes.windll.user32.SystemParametersInfoW(20, 26, uri, 1)
    else:
        def change_wallpaper(uri):
            uri = uri.replace("/", "\\")
            ctypes.windll.user32.SystemParametersInfoA(20, 26, uri, 1)

elif platform.system() == "Darwin":
    def change_wallpaper(uri):
        os.system('osascript -e \'tell application "Finder" to set desktop picture to POSIX file "{0}"\''.format(uri))

elif platform.system() == "Linux":
    import subprocess


    def get_output(command):
        p = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        out, err = p.communicate()
        return out


    try:
        v = int(get_output("gnome-session --version").split()[-1][0])
        if v == 2:
            def change_wallpaper(uri):
                os.system("gconftool-2 --type=string --set /desktop/gnome/background/picture_filename {0}".format(uri))
        elif v == 3:
            def change_wallpaper(uri):
                os.system('gsettings set org.gnome.desktop.background picture-uri "file://{0}"'.format(uri))
    except:
        raise OSError("Wallaper Change is supported in GNOME 2/3 and Unity only")


# thanks to https://github.com/geekpradd/PyWallpaper/blob/master/PyWallpaper.py


async def _main(websocket, path):
    async for message in websocket:
        parsed = json.JSONDecoder().decode(message)
        if list(parsed.keys())[0] == 'set-wallpaper':
            if parsed['set-wallpaper'].startswith('http'):
                filename = time.time()
                urllib.request.urlretrieve(parsed['set-wallpaper'], f'wallpaper{filename}.jpg')
                change_wallpaper(os.getcwd() + f'/wallpaper{filename}.jpg')
                os.remove(f'wallpaper{filename}.jpg')
            else:
                change_wallpaper(parsed['set-wallpaper'])
        await websocket.send('1')


async def main():
    async with websockets.serve(_main, "localhost", 8443):
        await asyncio.Future()


asyncio.run(main())
