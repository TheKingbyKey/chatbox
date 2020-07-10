document.addEventListener("DOMContentLoaded",()=>{
  
  document.querySelector("#log-password-Invalid").style.display = "none";
  document.querySelector("#log-username-Invalid").style.display = "none";
  document.querySelector("#sign-email-Invalid").style.display = "none";
  document.querySelector("#sign-username-Invalid").style.display = "none";
  var usernameglob;
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  socket.on('connect',()=>{
    document.querySelector("#login").onsubmit = ()=>{
      console.log("DONE");
      let username = document.querySelector("#username2").value;
      let password = document.querySelector("#password2").value;
      usernameglob = username;
      socket.emit("login",{"username":username,"password":password});
      return false;
    };
    document.querySelector("#signup").onsubmit = ()=>{
      let username = document.querySelector("#username").value;
      let name = document.querySelector("#name").value;
      let password = document.querySelector("#password").value;
      let email = document.querySelector("#email").value;
      usernameglob = username;
      socket.emit("signup",{"username":username,"name":name,"password":password,"email":email});
      return false;
    };
  });
  socket.on("signupfail",data=>{
    if(!data.email){
      document.querySelector("#sign-email-Invalid").style.display = "block";
    }
    if(!data.username){
      document.querySelector("#sign-username-Invalid").style.display = "block";
    }else{

    }
  });
  socket.on("signupsuccess",data=>{
    if(data.success){
       localStorage.setItem("username",usernameglob);
       window.location.href="http://localhost:5000/room";
      }
  });
  socket.on("loginfail",data=>{
    if(!data.username){
      console.log("DONE1");
      document.querySelector("#log-username-Invalid").style.display = "block";
    }
    if(!data.password){
      console.log("DONE2");
      document.querySelector("#log-password-Invalid").style.display = "block";
    }else{
console.log("DONE3");
    }
  });
  socket.on("loginsuccess",data=>{
    console.log("DONE4");
    if(data.success){
      console.log("DONE5");
       localStorage.setItem("username",usernameglob);
       window.location.href="http://localhost:5000/room";
      }
  });
});
