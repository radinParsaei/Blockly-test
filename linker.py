from typing import Union

import serial.tools.list_ports
import asyncio
import json
import os
import time

import websockets
import platform
import urllib.request
import _thread

portHandles = {}

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
        elif list(parsed.keys())[0] == 'list-serial-ports':
            ports = serial.tools.list_ports.comports()
            for port, desc, hwid in sorted(ports):
                await websocket.send(f'serial-port: {port}')
        elif list(parsed.keys())[0] == 'write-ser':
            portHandles[parsed['write-ser']].write(parsed['d'].encode())
        elif list(parsed.keys())[0] == 'close-port':
            portHandles[parsed['close-port']].close()
            del portHandles[parsed['close-port']]
        elif list(parsed.keys())[0] == 'set-dtr':
            portHandles[parsed['set-dtr']].setDTR(parsed['v'])
        elif list(parsed.keys())[0] == 'set-rts':
            portHandles[parsed['set-rts']].setRTS(parsed['v'])
        elif list(parsed.keys())[0] == 'set-br':
            portHandles[parsed['set-br']].break_condition = parsed['v']
        elif list(parsed.keys())[0] == 'connect-to-serial-port':
            baudRate = 9600
            dataBits = serial.EIGHTBITS
            parity = "N"
            if "baudRate" in parsed['confs']:
                baudRate = parsed['confs']['baudRate']
            if "stopBits" in parsed['confs']:
                dataBits = parsed['confs']['stopBits']
            if "parity" in parsed['confs']:
                parity = parsed['confs']['parity'].title()[0]
            portHandles[parsed['connect-to-serial-port']] = serial.Serial(parsed['connect-to-serial-port'],
                                                                          baudrate=baudRate, bytesize=dataBits, parity=parity)

            async def check_for_data(portName, ws):
                while True:
                    if portName in portHandles:
                        try:
                            for i in portHandles[portName].read():
                                await ws.send(f'sermsg:{portName}:{i}')
                        except Exception:
                            pass

            def check_for_data_(portName, ws):
                asyncio.new_event_loop().run_until_complete(check_for_data(portName, ws))

            _thread.start_new_thread(check_for_data_, (parsed['connect-to-serial-port'], websocket))
        await websocket.send('1')


async def main():
    async with websockets.serve(_main, "localhost", 8443):
        await asyncio.Future()


asyncio.run(main())
