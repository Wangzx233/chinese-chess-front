var username;
var roomid;

//初始化棋盘
var canvas = document.getElementById("myCanvas");

var ctx = canvas.getContext("2d");
var img = new Image();
img.src = "img/chess/qipan.png";
img.width = "515";
img.height = "580";
img.onload = function () {
  draw();
};
function draw() {
  canvas.width = img.width + 100;
  canvas.height = img.height + 100;
  ctx.drawImage(img, 20, 20, img.width, img.height);
}

//
//        P -> 兵
//        C -> 炮
//        R -> 车
//        N -> 马
//        B -> 象
//        Q -> 士
//        K -> 帅
//        . -> 空
//        -> 棋盘外
//
//大写为红方，小写为黑方

var arr = [
  ["dr", "dn", "db", "dq", "dk", "dq", "db", "dn", "dr"],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", "dc", ".", ".", ".", ".", ".", "dc", "."],
  ["dp", ".", "dp", ".", "dp", ".", "dp", ".", "dp"],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  ["rP", ".", "rP", ".", "rP", ".", "rP", ".", "rP"],
  [".", "rC", ".", ".", ".", ".", ".", "rC", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  ["rR", "rN", "rB", "rQ", "rK", "rQ", "rB", "rN", "rR"],
];

//渲染棋盘
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var img = new Image();
  img.src = "img/chess/qipan.png";
  img.width = "515";
  img.height = "580";
  img.onload = function () {
    draw();
  };
  function draw() {
    canvas.width = img.width + 100;
    canvas.height = img.height + 100;
    ctx.drawImage(img, 20, 20, img.width, img.height);
  }
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 9; j++) {
      if (arr[i][j] == ".") {
        continue;
      }
      let tempimg = new Image();
      tempimg.src = "img/chess/" + arr[i][j] + ".png";
      tempimg.width = 70;
      tempimg.height = 70;
      tempimg.onload = function () {
        ctx.drawImage(
          tempimg,
          j * (tempimg.width - 10),
          i * (tempimg.height - 10),
          tempimg.width,
          tempimg.height
        );
      };
    }
  }
}

//点击事件获取坐标
var option = "";
canvas.addEventListener("click", (e) => {
  x = e.pageX;
  y = e.pageY;

  //减去边距
  x -= 20;
  y -= 20;

  x = Math.ceil(x / 60) - 1;
  y = Math.ceil(y / 65) - 1;

  option += y;
  option += x;

  console.log(option);
  if (option.length >= 4) {
    operate(option);
    option = "";
  }
});

render();

//判断当前浏览器是否支持WebSocket
function link() {
  username = document.getElementById("username").value;
  roomid = document.getElementById("roomid").value;
  if ("WebSocket" in window) {
    websocket = new WebSocket("ws://8.142.81.74:10086/websocket/" + username);
    console.log("link success");
  } else {
    alert("Not support websocket");
  }
  //连接发生错误的回调方法
  websocket.onerror = function () {
    setMessageInnerHTML("error");
  };

  //连接成功建立的回调方法
  websocket.onopen = function (event) {
    setMessageInnerHTML("open");
  };
  console.log("-----");
  //接收到消息的回调方法
  websocket.onmessage = function (event) {
    var cnt = JSON.parse(event.data);
    switch (cnt.Type) {
      case -1:
        alert(cnt.Content);
        break;
      case 0:
        setMessageInnerHTML(cnt.From + ": " + cnt.Content);
        break;
      case 2:
        if (cnt.Content == "0") {
          alert("你是红方");
        } else {
          alert("你是黑方");
        }
        break;ß
      case 3:
        var f1 = parseInt(cnt.Content[0]);
        var f2 = parseInt(cnt.Content[1]);
        var t1 = parseInt(cnt.Content[2]);
        var t2 = parseInt(cnt.Content[3]);
        console.log(f1);
        arr[t1][t2] = arr[f1][f2];
        arr[f1][f2] = ".";
        render();
        break;
      case 4:
        if (cnt.Content == "0") {
          alert("红方胜利！");
        } else {
          alert("黑方胜利！");
        }
    }
  };

  //连接关闭的回调方法
  websocket.onclose = function () {
    setMessageInnerHTML("close");
  };
}

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
  websocket.close();
};

//将消息显示在网页上
function setMessageInnerHTML(innerHTML) {
  document.getElementById("message").innerHTML += innerHTML + "<br/>";
}

//关闭连接
function closeWebSocket() {
  websocket.close();
}

//发送消息
function send() {
  var message = document.getElementById("text").value;
  var data = {
    Type: 0,
    From: username,
    To: roomid,
    Content: message,
    RoomID: roomid,
  };
  websocket.send(JSON.stringify(data));
}

function join() {
  roomid = document.getElementById("roomid").value;
  var data = {
    Type: 1,
    From: username,
    To: roomid,
    Content: roomid,
    RoomID: roomid,
  };
  websocket.send(JSON.stringify(data));
}

function operate(option) {
  // var option = document.getElementById('option').value;
  var data = {
    Type: 3,
    From: username,
    To: roomid,
    Content: option,
    RoomID: roomid,
  };
  websocket.send(JSON.stringify(data));
}

function ready() {
  var username = document.getElementById("username").value;
  var data = {
    Type: 2,
    From: username,
    To: roomid,
    Content: "",
    RoomID: roomid,
  };
  websocket.send(JSON.stringify(data));
}
