var wheel = document.getElementById('wheel'); // 转盘
var arrow = document.getElementById('arrow'); // 转盘按钮
var record = document.getElementById('record');
var back = document.getElementById('back');
var confirm = document.getElementById('confirm');
var popBg = document.getElementById('popBg');
// 转盘游戏属性
var gameState = false; //  游戏状态
//var luckDrawCount = 10;         //  抽奖次数
var rotateZ = 360; //  一圈360deg
var rotateZCount = 10; //  旋转圈数的倍数
var runTime = 6; //  游戏过度时间

// 奖品指针位置
// 20   一等奖，
// 158  二等奖，
// 200  二等奖，
// 112  三等奖，
// 68   四等奖，
// 计算归着，每次抽奖最终rotateZ值 + 相应的奖品值位置 = (rotateZCount + rotateZPosition[0]) 等于一等奖
var rotateZPosition = [20, 70,110, 158, 210];

function getRecordByApp() {

    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.getRecordByApp();
        } catch (e) {

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.getRecordByApp.postMessage({
                'name': 'getRecordByApp'
            })
        } catch (e) {

        }
    }
}

function showPop(text) {
    popBg.setAttribute('class', 'pop');
    var pop = document.getElementById('pop');
    var tips = document.getElementById('tips');
    pop.style.display = 'block';
    tips.innerText = text;

}

function showErrorPop(text) {
    popBg.setAttribute('class', 'pop-error');
    var pop = document.getElementById('pop');
    var tips = document.getElementById('tips');
    pop.style.display = 'block';
    tips.innerText = text;
}

function lottery() {
    $.ajax({
        type: 'post',
        dataType: 'json',
        async: false,
        url: 'http://apitest.walongkeji.com/lotteryDraw/auth/lotteryDraw',
        beforeSend: function(request) {
            request.setRequestHeader('userId', userId);
            request.setRequestHeader('ticket', ticket);
        },
        data: {
            type: 1
        },
        success: function(data) {
            if (data.code == '0') {
                wheel.style.transform = 'rotateZ(' + (rotateZ * rotateZCount + rotateZPosition[data.data.prizeIndex - 1]) + 'deg)';
                setTimeout(() => {
                    gameState = false; // 设置游戏当前状态
                    showPop('您获得' + data.data.prizeContent);
                    // alert('恭喜您中'+data.data.prizeIndex+'等级\r\n,获得'+data.data.prizeContent);
                }, (runTime * 1000 + 200));

            } else if (data.success == false) {

            } else {

            }
        },
        error: function() {
            alert('错误,请重试');
        }

    });

}





// 运行游戏
function gameAction() {
    /// 转盘位置计算规则 一圈360deg 乘以 10圈，加上 奖品 rotateZ值，再减去上一次中奖rotateZ值

    //  var toRotateZCount = (rotateZPositionCount - preUseRotateZ + rotateZPosition[rotateZPositionIndex]) + rotateZ * rotateZCount; // 达到圈数位置
    wheel.style.transition = 'transform ' + runTime + 's ease-in-out 0s'; // 过度时间
    // wheel.style.transform = 'rotateZ(' + rotateZ*rotateZCount + 'deg)'; // 旋转
    // wheel.style.transform = 'rotateZ(' + (rotateZ*rotateZCount+rotateZPosition[3]) + 'deg)'; // 旋转
    //  preUseRotateZ = rotateZPosition[rotateZPositionIndex]; // 上传抽奖的中奖rotateZ
    //  rotateZPositionCount = toRotateZCount; // 保存当前转盘值
    // luckDrawCount = luckDrawCount-1;  // 游戏次数减一
    lottery();
    lotteryConut = lotteryConut - 1; // 游戏次数减一
    // gameState = false;
    // 页面更新抽奖次数
    // luckDrawCountDom.innerHTML = luckDrawCount;

}


// 开始游戏
arrow.addEventListener('click', function() {

    // 判断游戏是否进行中
    if (gameState) return;
    //判断是否还有抽奖资格
    if (lotteryConut <= 0) {
        showErrorPop('您的中奖次数已用完~');
        return;
    }
    gameState = true; // 设置游戏当前状态
    // run game
    gameAction();
}, false);



record.addEventListener('click', getRecordByApp, false);

confirm.addEventListener('click', function() {
    var pop = document.getElementById('pop');
    pop.style.display = 'none';
    getRecordByApp();
}, false);

back.addEventListener('click', function() {
    var pop = document.getElementById('pop');
    pop.style.display = 'none';
}, false);
