import os
import base64
from flask import Flask,request,url_for,render_template,flash,redirect
from flask_socketio import SocketIO, emit,join_room, leave_room,rooms
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

engine = create_engine("mysql+pymysql://root:arora@localhost/chatbox")
db = scoped_session(sessionmaker(bind=engine))
path = "C:\\Users\\Bharti Arora\\Desktop\\project2\\static\\uploads\\profile"
@app.route("/")
def index():
    return render_template("home.html")

@socketio.on("signup")
def signup(data):
    username = data["username"]
    name = data["name"]
    email = data["email"]
    password = data["password"]
    result = db.execute("SELECT * FROM users WHERE username=:username or email=:email;",{"username":username,"email":email}).fetchone()
    if(result):
        emit("signupfail",{"email":False,"username":False})
    else:
       try:
           db.execute("INSERT INTO users(name,email,username,password) VALUES (:name,:email,:username,:password);",{"name":name,"email":email,"username":username,"password":password})
           result = db.execute("SELECT id FROM users WHERE username=:username;",{"username":username}).fetchone()
           db.execute("INSERT INTO personal(userid) VALUES(:userid);",{"userid":int(result[0])})
           db.commit()
           emit("signupsuccess",{"success":True})
       except:
           emit("signupfail",{"email":True,"username":True})

@socketio.on("login")
def login(data):
    username = data["username"]
    password = data["password"]
    try:
        
        result = db.execute("SELECT password FROM users WHERE username=:username;",{"username":username}).fetchone()
        print(result)
        if result:
            if result[0] == password:
                emit("loginsuccess",{"success":True})
            else:
                emit("loginfail",{"password":False,"username":True})
        else:
            emit("loginfail",{"password":True,"username":False})
    except:
        return "error"
        emit("loginfail",{"password":True,"username":True})

@app.route("/room")
def room():
    return render_template("room.html")

@app.route("/channel")
def channel():
    return render_template("channel.html")

@app.route("/profile/<string:username>")
def profile(username):
    return render_template("profile.html",username=username)

@socketio.on("ask details")
def send_details(data):
    username = data["username"]
    try:
        result1 = db.execute("SELECT id,name,email FROM users WHERE username = :username;",{"username":username}).fetchone()
        result2 = db.execute("SELECT address,company,pic FROM personal WHERE userid=:userid;",{"userid":int(result1[0])}).fetchone()
        emit("get details",{"success":True,"name":result1[1],"email":result1[2],"address":result2[0],"company":result2[1],"pic":result2[2]})
    except:
        emit("get details",{"success":False})
        
@socketio.on("upload image")
def uploadImage(data):
    username = data["username"]
    filetype = data["filename"].split('.')[1]
    filename = "profile"+username+"."+filetype
    #print(data["binary"].split(',')[1])
    file = open(os.path.join(path,filename),"wb")
    file.write(base64.b64decode(data["binary"].split(',')[1]))
    result = db.execute("SELECT id FROM users WHERE username=:username;",{"username":username}).fetchone()
    db.execute("UPDATE personal SET pic=:filename WHERE userid = :userid;",{"filename":filename,"userid":result[0]})
    db.commit()
    emit("send image",{"pic":filename})
    
@socketio.on("editprofile")
def editProfile(data):
    print(data)
    username = data["confirm_username"]
    password = data["confirm_password"]
    try:
        
        result = db.execute("SELECT password,id FROM users WHERE username=:username;",{"username":username}).fetchone()
        print(result)
        if result:
            if result[0] == password:
                if(data["password"]["has"]):
                    db.execute("UPDATE users SET password = :value WHERE username = :username;",{"value":data["password"]["value"],"username":username})
                if(data["username"]["has"]):
                    db.execute("UPDATE users SET username = :value WHERE username = :username;",{"value":data["username"]["value"],"username":username})
                    username = data["username"]["value"]
                if(data["address"]["has"]):
                    db.execute("UPDATE personal SET address = :value WHERE userid = :userid;",{"value":data["address"]["value"],"userid":int(result[1])})
                if(data["company"]["has"]):
                    db.execute("UPDATE personal SET company = :value WHERE userid = :userid;",{"value":data["company"]["value"],"userid":int(result[1])})
                db.commit()
                result2 = db.execute("SELECT address,company FROM personal WHERE userid=:userid;",{"userid":int(result[1])}).fetchone()
                emit("success-edit",{"success":True,"username":username,"address":result2[0],"company":result2[1]})
            else:
                emit("fail-edit",{"passwordsuccess":False,"usersuccess":True})
        else:
            emit("fail-edit",{"passwordsuccess":True,"usersuccess":False})
    except:
        return "error"
        emit("loginfail",{"password":True,"username":True})
        
@socketio.on("create channel")
def createChannel(data):
    username = data["confirm_username"]
    password = data["confirm_password"]
    try:
        result = db.execute("SELECT password,id FROM users WHERE username=:username;",{"username":username}).fetchone()
        print(result)
        if result:
            if result[0] == password:
                result1 = db.execute("SELECT id FROM channels WHERE name = :name;",{"name":data["name"]}).fetchone()
                if(result1):
                   emit("create channel fail",{"channelsuccess":False,"passwordsuccess":True})
                else:
                    db.execute("INSERT INTO channels(admin,mode,name,password) VALUES(:admin,:mode,:name,:password);",{"admin":int(result[1]),"mode":data["mode"],"name":data["name"],"password":data["password"]})
                    db.commit()
                    emit("create channel success",{"name":data["name"]},broadcast=True)
            else:
                emit("create channel fail",{"passwordsuccess":False,"channelsuccess":True})
        else:
            emit("create channel fail",{"passwordsuccess":False,"channelsuccess":False})
    except:
        return "error"
        emit("loginfail",{"password":True,"username":True})
        
@socketio.on("get channels")
def sendchannels():
    results = db.execute("SELECT name FROM channels").fetchall();
    channels = []
    for result in results:
        channels.append(result[0])
    emit("send channels",{"channels":channels})
    
@socketio.on("join room")
def joinroom(data):
    room = data["room"]
    username = data["username"]
    if room in rooms():
        join_room(room)
    else:
        join_room(room)
        emit("room joined",{"content":f"{username} has joined the room","username":username},room = room,broadcast = True)

@socketio.on("message send")
def sendmessage(data):
    print(data)
    content = data["content"]
    time = data["time"]
    date = data["date"]
    username = data["username"]
    typ = data["type"]
    room = data["room"]
    result = db.execute("SELECT id FROM users WHERE username = :username;",{"username":username}).fetchone()
    userid = result[0]
    result = db.execute("SELECT id FROM channels WHERE name = :name;",{"name":room}).fetchone()
    channelid = result[0]
    db.execute("INSERT INTO messages(userid,channelid,content,sendtime,senddate,type) VALUES(:userid,:channelid,:content,:sendtime,:senddate,:type);",{"userid":userid,"channelid":channelid,"content":content,"sendtime":time,"senddate":date,"type":typ})
    db.commit()
    emit("put message",{"content":content,"type":typ,"username":username,"time":time,"date":date},room = room,broadcast=True)
    
@socketio.on("leave room")
def leaveroom(data):
    room = data["room"]
    username = data["username"]
    if room in rooms():
      leave_room(room)
      emit("room left",{"content":f"{username} has left the room"},room = room,broadcast = True)
    
    
@socketio.on("get messages")
def sendmessages(data):
    room = data["room"]
    res = db.execute("SELECT id,mode FROM channels WHERE name = :name;",{"name":room}).fetchone()
    mode = res[1]
    if(mode == "public"):
        return sendmessages2(data)
    else:
        emit("channel is private",{"success":False})
        
@socketio.on("get private messages")
def private(data):
    room = data["room"]
    password = data["password"]
    res = db.execute("SELECT password FROM channels WHERE name = :name;",{"name":room}).fetchone()
    passcheck = res[0]
    if password == passcheck:
        return sendmessages2(data)
    else:
        emit("all messages",{"success":False})


def sendmessages2(data):
    room = data["room"]
    res = db.execute("SELECT id FROM channels WHERE name = :name;",{"name":room}).fetchone()
    channelid = int(res[0])
    results = db.execute("SELECT userid,content,sendtime,senddate,type FROM messages WHERE channelid = :channelid ORDER BY senddate ASC,sendtime ASC;",{"channelid":channelid}).fetchall()
    messages = []
    for result in results:
        name = db.execute("SELECT username FROM users where id = :id;",{"id":result[0]}).fetchone()
        info = {"username":name[0],"content":result[1],"time":str(result[2]),"date":str(result[3]),"type":result[4] }
        messages.append(info)
    emit("all messages",{"success":True,"messages":messages})
    
if __name__ == "__main__":
    socketio.run(app)
