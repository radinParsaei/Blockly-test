import time
import random
from flask import Flask, request, redirect, make_response
import flask_cors
import os

#main
app = Flask(__name__)
flask_cors.CORS(app)

if not ('sharedFiles' in os.listdir() and not os.path.isfile('sharedFiles')):
    os.mkdir('sharedFiles')

@app.route('/', methods=['POST', 'GET'])
def root():
    # if method is GET redirect user to main page
    if request.method == 'GET':
        return redirect("https://radinparsaei.github.io/Blockly-test/")
    # else save code to a file and return that file's id
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
