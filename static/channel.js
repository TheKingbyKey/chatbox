
document.addEventListener("DOMContentLoaded",()=>{

  if(window.innerWidth<701){
    document.querySelector(".major").className = "col-12 major";
    document.querySelector(".minor").className = "col-12 minor collapse";
  }else{
    document.querySelector(".major").className = "col-9 major";
    document.querySelector(".minor").className = "col-3 minor";
  }
  window.addEventListener("resize",()=>{
    if(window.innerWidth<701){
      document.querySelector(".major").className = "col-12 major";
      document.querySelector(".minor").className = "col-12 minor collapse";
    }else{
      document.querySelector(".major").className = "col-9 major";
      document.querySelector(".minor").className = "col-3 minor";
    }
  });


  document.querySelector("#username").innerHTML = localStorage.getItem("username");
  document.querySelector("#channelname").innerHTML = localStorage.getItem("channel");

  let ele = document.querySelector("#message");
  ele.onkeyup = ()=>{
    let message = ele.value;
    if(message.length>0){
      document.querySelector("#sendmessage").disabled = false;
    }else{
      document.querySelector("#sendmessage").disabled = true;
    }
  };




  const template = Handlebars.compile(document.querySelector("#channellist").innerHTML);
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on("connect",()=>{
     socket.emit("get channels");
     socket.emit("get messages",{"room":localStorage.getItem("channel")});
     document.querySelector("#channelEntry").onsubmit = ()=>{
       let password = document.querySelector("#password").value;
       socket.emit("get private messages",{"room":localStorage.getItem("channel"),"password":password});
       return false;
     };
     document.querySelector("#sendmessages").onsubmit = ()=>{
       let message = document.querySelector("#message").value;
       document.querySelector("#message").value = "";
       document.querySelector("#sendmessage").disabled = true;
       let today = new Date();
       let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
       let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
       let type = "text";
       socket.emit("message send",{"content":message,"type":type,"room":localStorage.getItem("channel"),"username":localStorage.getItem("username"),"time":time,"date":date});
       return false;
     };
     document.addEventListener("click",event => {
       const ele = event.target;
       if(ele.id === "logout" ){
         socket.emit("leave room",{"room":localStorage.getItem("channel"),"username":localStorage.getItem("username")});
         localStorage.removeItem("username");
         localStorage.removeItem("channel");
         window.location.href = "http://localhost:5000/";
       }else if(ele.className === "btn btn-link channelLink"){
         let name = ele.innerHTML;
         socket.emit("leave room",{"room":localStorage.getItem("channel"),"username":localStorage.getItem("username")});
         localStorage.setItem("channel",name);
         window.location.href = "http://localhost:5000/channel";
       }else if(ele.id === "username"){
         socket.emit("leave room",{"room":localStorage.getItem("channel"),"username":localStorage.getItem("username")});
         localStorage.removeItem("channel");
         window.location.href = "http://localhost:5000/room";
       }else if(ele.id === "sendmessage"){
         let message = document.querySelector("#message").value;
         document.querySelector("#message").value = "";
         document.querySelector("#sendmessage").disabled = true;
         let today = new Date();
         let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
         let date = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
         let type = "text";
         socket.emit("message send",{"content":message,"type":type,"room":localStorage.getItem("channel"),"username":localStorage.getItem("username"),"time":time,"date":date});
       }else if(ele.id === "joinroom"){
         socket.emit("join room",{"room":localStorage.getItem("channel"),"username":localStorage.getItem("username")});
       }else if(ele.className === "sender"){
           socket.emit("leave room",{"room":localStorage.getItem("channel"),"username":localStorage.getItem("username")});
           localStorage.removeItem("channel");
           let variable = ele.innerHTML;
           window.location.href = `http://localhost:5000/profile/${variable}`;
           return false;
        }
     });
     window.onbeforeunload = e =>{
       if(!localStorage.getItem("username")){
         return;
       }
       if(!localStorage.getItem("channel")){
         return;
       }
       socket.emit("leave room",{"room":localStorage.getItem("channel"),"username":localStorage.getItem("username")});
     };
  });

 socket.on("room joined",data =>{
   const element = document.querySelector("#messages");
   let flag = false;
   if(element.scrollTop === (element.scrollHeight-element.offsetHeight)){
     flag = true;
   }
   let ele = document.createElement("span");
   ele.style.float = "center";
   ele.innerHTML = data.content;
   ele.className = "badge badge-warning";
   document.querySelector("#messages").append(ele);
   document.querySelector("#messages").innerHTML +="<br>";
   if(data.username === localStorage.getItem("username")){
     flag = true;
   }
   if(flag){
     element.scrollTop = element.scrollHeight;
   }
 });
 socket.on("room left",data=>{
   const element = document.querySelector("#messages");
   let flag = false;
   if(element.scrollTop === (element.scrollHeight-element.offsetHeight)){
     flag = true;
   }
   let ele = document.createElement("span");
   ele.style.float = "center";
   ele.innerHTML = data.content;
   ele.className = "badge badge-warning";
   document.querySelector("#messages").append(ele);
   document.querySelector("#messages").innerHTML += "<br>";
   if(flag){
     element.scrollTop = element.scrollHeight;
   }
 });
 socket.on("put message",data=>{
   const element = document.querySelector("#messages");
   let flag = false;
   if(element.scrollTop === (element.scrollHeight-element.offsetHeight)){
     flag = true;
   }
   let ele = document.createElement("div");
   if(localStorage.getItem("username") === data.username){
     ele.style.float = "right";
     ele.className = "badge badge-primary";
     flag = true;
   }else{
     ele.style.float = "left";
     ele.className = "badge badge-danger";
   }
   let elein = document.createElement("small");
   elein.innerHTML = data.username;
   elein.className = "sender";
   ele.append(elein);
   ele.innerHTML += "<br>";
   if(data.type == "text"){
     ele.innerHTML += data.content;
   }

   ele.style.margin = "2px";
   document.querySelector("#messages").append(ele);
   document.querySelector("#messages").innerHTML += "<br><br>";
   if(flag){
     element.scrollTop = element.scrollHeight;
   }
 });

socket.on("channel is private",data=>{
  document.querySelector("#messages").style.display = "none";
  document.querySelector("#sendmessages").style.display = "none";
  document.querySelector("#entry").style.display = "block";
});

socket.on("all messages",data=>{
  if(data.success){
    document.querySelector("#messages").style.display = "block";
    document.querySelector("#sendmessages").style.display = "block";
    document.querySelector("#entry").style.display = 'none';
    document.querySelector("#wrongpassword").style.display = 'none';
    data.messages.forEach(printmessages);
    document.querySelector("#joinroom").click();
    setTimeout(() => { const element = document.querySelector("#messages");
    element.scrollTop = element.scrollHeight;  }, 2000);
  }else{
    document.querySelector("#wrongpassword").style.display = 'block';
  }
});


  socket.on("send channels",data=>{
    const content = template({"values":data.channels});
    document.querySelector("#dekstopchannels").innerHTML = content;
  });

  socket.on("create channel success",data=>{
    let channels = [];
    channels.push(data.name);
    const content = template({"values":channels});
    document.querySelector("#dekstopchannels").innerHTML += content;
  });
  const element = document.querySelector("#messages");
  element.scrollTop = element.scrollHeight;
});

function printmessages(value){
  let ele = document.createElement("div");
  if(localStorage.getItem("username") === value.username){
    ele.style.float = "right";
    ele.className = "badge badge-primary";
    flag = true;
  }else{
    ele.style.float = "left";
    ele.className = "badge badge-danger";
  }
  let elein = document.createElement("small");
  elein.className = "sender";
  elein.innerHTML = value.username;
  ele.append(elein);
  ele.innerHTML += "<br>";
  if(value.type == "text"){
    ele.innerHTML += value.content;
  }

  ele.style.margin = "2px";
  document.querySelector("#messages").append(ele);
  document.querySelector("#messages").innerHTML += "<br><br>";

}
window.onpopstate = e =>{
  localStorage.removeItem("channel");
};
