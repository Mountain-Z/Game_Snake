let sw = 20,
  sh = 20,
  tr = 30,
  td = 30;

let snake = null,
  food = null,
  game = null;

let timer = null;
let speed = 200;

function Square(x, y, classname) { //蛇的身体部件
  this.x = x * sw;
  this.y = y * sh;

  this.viewContent = document.createElement("div");
  this.viewContent.className = classname;
  this.parrent = document.getElementById("snake");
}
Square.prototype.create = function () {  //蛇的身体部件样式
  this.viewContent.style.position = "absolute";
  this.viewContent.style.width = sw + "px";
  this.viewContent.style.height = sh + "px";
  this.viewContent.style.left = this.x + "px";
  this.viewContent.style.top = this.y + "px";
  this.parrent.appendChild(this.viewContent);
};
Square.prototype.remove = function () {  //移除
  this.parrent.removeChild(this.viewContent);
};

function Snake() {
  this.head = null;  //存储蛇头信息
  this.tail = null;  //存储蛇尾信息
  this.pos = [];     //蛇各部位坐标
  this.directionNum = {
    left: { x: -1, y: 0, rotate: 180 },
    right: { x: 1, y: 0, rotate: 0 },
    up: { x: 0, y: -1, rotate: -90 },
    down: { x: 0, y: 1, rotate: 90 },
  };
}

Snake.prototype.init = function () { //对蛇进行初始化
  //头
  let snakehead = new Square(2, 0, "head");
  snakehead.create();
  this.head = snakehead;
  this.pos.push([2, 0]);
  console.log(this.head);
  //身体
  let snakebody1 = new Square(1, 0, "body");
  snakebody1.create();
  this.pos.push([1, 0]);

  let snakebody2 = new Square(0, 0, "body");
  snakebody2.create();
  this.pos.push([0, 0]);
  this.tail = snakebody2;
  //初始化链表,只需控制首尾
  snakehead.last = null;
  snakehead.next = snakebody1;

  snakebody1.last = snakehead;
  snakebody1.next = snakebody2;

  snakebody2.last = snakebody1;
  snakebody2.next = null;

  //添加属性控制蛇的方向
  this.direction = this.directionNum.right;
};

//获取蛇头的下一个位置的元素
Snake.prototype.getNextpos = function () {
  let nextpos = [
    this.head.x / sw + this.direction.x,
    this.head.y / sh + this.direction.y
  ];
  //判断是否撞到自己
  let selfCollied = false;
  this.pos.forEach(function (item) {
    if (item[0] == nextpos[0] && item[1] == nextpos[1]) {
      selfCollied = true
    };
  });
  if (selfCollied) {
    console.log('自己')
    this.strategies.die.call(this);
    return;
  }
  //判断是否撞墙
  if (nextpos[0] < 0 || nextpos[1] < 0 || nextpos[0] > td - 1 || nextpos[1] > tr - 1) {
    this.strategies.die.call(this);
    return;
  }
  //移动
  this.strategies.move.call(this);
  //吃
  if (food && food.pos[0] == nextpos[0] && food.pos[1] == nextpos[1]) {

    this.strategies.eat.call(this);
  }
};
Snake.prototype.strategies = {
  move(del) {
    //创建新身体
    let newbody = new Square(this.head.x / sw, this.head.y / sh, 'body')

    newbody.next = this.head.next
    newbody.next.last = newbody
    this.head.remove()
    newbody.create()
    //创建新头
    let newhead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'head')
    newhead.next = newbody  //新头的下一个节点
    newhead.last = null
    newhead.create()
    newhead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
    newbody.last = newhead;  //新身体前一个节点
    this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
    this.head = newhead //更新蛇头信息

    if (!del) {  //如果吃传参数否则删
      this.tail.remove()
      this.tail = this.tail.last
      this.pos.pop()
    }
  },
  eat() {
    this.strategies.move.call(this, true)
    //设计模式简单
    createFood()
  },
  die() {
    console.log("die");
    clearInterval(timer)
  },
};
snake = new Snake();

function createFood() {
  let x = null;
  let y = null;
  let include = true;
  while (include) {
    x = Math.round(Math.random() * (td - 1))
    y = Math.round(Math.random() * (tr - 1))
    snake.pos.forEach(function (item) {
      if (x != item[0] && y != item[1]) {
        include = false;
      }
    })
  }
  food = new Square(x, y, 'food')
  food.pos = [x, y]
  let foodDom = document.querySelector('#snake .food')
  if (foodDom) {
    foodDom.style.left = x * sw + 'px'
    foodDom.style.top = y * sh + 'px'
  } else {
    food.create()
  }
}

function Game() {

}

Game.prototype.init = function () {
  snake.init();
  createFood()
  document.onkeydown = function (e) {  //控制蛇的方向
    if (e.keyCode == 37 && snake.direction != snake.directionNum.right) {
      snake.direction = snake.directionNum.left
    } else if (e.keyCode == 39 && snake.direction != snake.directionNum.left) {
      snake.direction = snake.directionNum.right
    } else if (e.keyCode == 38 && snake.direction != snake.directionNum.down) {
      snake.direction = snake.directionNum.up
    } else if (e.keyCode == 40 && snake.direction != snake.directionNum.up) {
      snake.direction = snake.directionNum.down
    }
  }
  this.start();
}

Game.prototype.start = function () {
  timer = setInterval(function () {
    snake.getNextpos()
  }, speed)
}

game = new Game();

let startBtn = document.querySelector('.start button');
console.log(startBtn)
startBtn.onclick = function () {
  startBtn.parentNode.style.display = 'none';
  game.init();
}


// startBtn.addEventListener('click', function () {
//   startBtn.parentNode.style.display = 'none';
//   console.log('sdf')

// })
// game.init();

