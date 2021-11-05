import time
import random
from flask import Flask, request, redirect, make_response, abort
import flask_cors
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import _thread

check = 0
max_size = 450000000
# max_size = 100
maxfilesize = size = max_size / 50000
if int(maxfilesize) == 0:
    maxfilesize = 1

#main
app = Flask(__name__)
flask_cors.CORS(app)
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["70 per day", "30 per hour", "1 per second"],
)

def free_space():
    while get_size('sharedFiles') > max_size:
        l = os.listdir('sharedFiles')
        l.sort()
        try:
            os.remove(f'sharedFiles/{l[0]}')
        except:
            pass

def get_size(path):
    res = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                res += os.path.getsize(fp)
    return res

if not ('sharedFiles' in os.listdir() and not os.path.isfile('sharedFiles')):
    os.mkdir('sharedFiles')

@app.route('/', methods=['POST', 'GET'])
def root():
    global check
    # if method is GET redirect user to main page
    if request.method == 'GET':
        return redirect("https://radinparsaei.github.io/Blockly-test/")
    cl = request.content_length
    if cl is not None and cl > maxfilesize:
        abort(413)
    if cl is None or cl == 0:
        abort(404)
    # else save code to a file and return that file's id
    if check % 10 == 0:
        check = 1
        _thread.start_new_thread(free_space, ())
    else:
        check += 1
    id = (str(time.time()) + str(random.randint(0, int(random.random() * 100000))) + str(request.remote_addr)[:3] + str(request.remote_addr)[-1]).replace('.', '')
    with open(f'sharedFiles/{id}', 'w') as file:
        file.write(request.get_data().decode('UTF-8'))
    return make_response(id)

@app.route('/<id>', methods=['GET'])
def getFile(id):
    try:
        with open(f'sharedFiles/{id}') as file:
            return file.read()
    except:
        return '', 404

app.run(port=8088)
