var http = "https://xiaolvlan.walongkeji.com",

    // http://122.112.237.84:8088

    userInfo = {
        userId: " ",
        ticket: " "
    };
userInfo.userId = GetQueryString("userId");
console.log(userInfo);
userInfo.ticket = GetQueryString("ticket");

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return "";
}

activeID = null;


let goodsClassData = {
    plateId: 3,
    plusStartTime: 1

}
let goodsListData = {
    plateId: 3,
    memberType: 1,
    page: 0,
    pageSize: 10,
    rrStatus: 1

}
let reservation = {
    startTime: 0,
    relationId: 0,
    relationSubId: 0,
    pushText: 0,
    extrasparam: 0

}


var timeList = []; //时间列表
var goodsList = []; //商品列表

//时间分类请求      
$.ajax({
    url: http + "/goodsOpts/getGoodsOptsList",
    type: "get",
    data: goodsClassData,
    success: function (res) {
        if (res.success) {
            timeList = res.data;
            timescrollBar(timeList);
        }
    }
});
//时间分类
function timescrollBar(timeList) {
    // alert(i[0].optName);
    if (timeList.length > 0) {
        var html = '',
            time = new Date().getTime(), //当前时间
            active_index = 0, //正在抢购的位置
            stayActiveStatus = false, //是否正在抢购
            unstart_index = []; //未开始数组（存入未开始的位置）
        timeList.forEach(function (e, i) {
            var isrendr = false;
            if (e.buyStatus == 4) { //如果当前时间在 starttime 和 endtime之内，是开抢
                active_index = i + 1; //开抢的位置
                stayActiveStatus = true;
            } else if (e.buyStatus == 2) {
                unstart_index.push(i + 1); //未开抢，放入未开抢数组
                stayActiveStatus = false;
            }
            //如果当前e为开抢，或者第一个未开抢 
            if ((active_index !== 0 && stayActiveStatus) || (active_index == 0 && !stayActiveStatus && unstart_index.length == 1)) {
                isrendr = true; //
            }
            //每一个时间选项里面的内容
            html += `<li 
                    data-id=` + e.id + `
                    class='slide-item' 
                    onclick='selectTimeData(` + e.id + `)'>
                        <p>` + htmlchange(isrendr, e.startTime, e.endTime) + `</p>
                        <p class=` + fontColor(isrendr) + `>` + isStayActive(e.buyStatus) + `</p>
                    </li>`
        });
        $('.rob ul').html(html); //填充至 ul 
        //判断时间分类的id
        var vars = window.location.search.substring(0).split("&"); //分割每个参数
        var optid = null; //参数id
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("="); //分割名和属性
            if (pair[0] == "Grabgoodgoods_id") { //Grabgoodgoods_id:传递过来的时间分类的id
                optid = pair[1]; //获取Grabgoodgoods_id的值
            }
        }
        var activeOpt; //把时间的分类作为acticeOpt显示这个时间分类的商品
        if (optid != null) { //如果有接收到参数id
            timeList.forEach(function (e) {
                if (e.id == optid) {
                    activeOpt = e;
                }
            });
        } else if (active_index == 1 && stayActiveStatus) { //当前e为开抢
            activeOpt = timeList[active_index - 1];
        } else {
            activeOpt = timeList[0];
        }
        showTimeData(activeOpt); //根据时间分类，设置倒计时和商品列表
        //如果有抢购就定位到抢购 如果没有就定位到最近
        var body_w = parseInt($('.rob').css('width').slice(0, -2)), //rob宽度
            scrollBar_w = parseInt($('.rob ul li').find('p').css('width').slice(0, -2)), //每个li的宽度
            block_w = active_index == 0 ? unstart_index[0] : active_index; //下标计数，全未开始选第一个时间，有开始选开始时间

        if ((scrollBar_w * block_w) > body_w) { //每个li的宽度 * 计数 如果大于 rob的宽度
            var w = (scrollBar_w * block_w) - (body_w / 2) - (scrollBar_w / 2);
            $('.rob ul').scrollLeft(w); //定位到这个 li
        }


    }
}

function selectTimeData(id) {
    $('.rob ul li').each((i, e) => {
        if ($(e).attr('data-id') === id) {
            showTimeData(timeList[i])
        }
    })
}
var interval;
//根据时间分类，设置倒计时和商品列表
function showTimeData(opt) {
    clearInterval(interval);
    //倒计时测试
    interval = setInterval(function () {
        opt.buyTime--;
        formatSeconds(opt.buyStatus, opt.buyTime)
    }, 1000);
    var html = `<img src="./image/rob_goods_icon_alarm_clock.png" alt="" />
                <p>` + (opt.buyStatus == 1 || opt.buyStatus == 4 ? "本场结束还剩" : "最近一场开始还剩") + `</p>`;
    $(".countdown .str").html(html);
    //显示商品列表
    conterentlistDate(opt);
    if (getHour(opt.startTime) == "12:00") {
        $("#imgInit").show();
    } else {
        $("#imgInit").hide();
    }
    calWidth() //进度条进度显示

}


/**
 * 倒计时
 * 时间分类
 * @param buyStatus 状态
 * @param startTime 开始时间
 * @param buyTime 持续时间
 * buyStatus, startTime, buyTime
 */
function setRemainTime(opt) {
    let start = new Date(opt.startTime).getTime(), //时间分类的starttime
        now = new Date().getTime(), //测试用时间
        time = 0; //倒计时剩余的秒数
    if (now >= start) { //开始计时
        time = opt.buyTime - ((now - start) / 1000); //倒计时剩余时间
    }
    formatSeconds(opt.buyStatus, time);
}
/**
 * 把秒转换成时间，并添加到倒计时位置
 * @param buyStatus 状态
 * @param time 要转换的时间：秒
 */
function formatSeconds(buyStatus, time) {
    var html = ""; //倒计时div内的html代码
    let hour = 0, //小时
        minute = 0, //分
        second = time < 0 ? -parseInt(time) : parseInt(time); //秒

    if (second > 60) { //60秒以上
        minute = parseInt(second / 60); //得到分
        second = parseInt(second % 60); //得到秒
        if (minute > 60) { //60分钟以上
            hour = parseInt(minute / 60); //得到小时
            minute = parseInt(minute % 60); //得到分
        }
    }
    $('#t-h').text(hour < 10 ? "0" + hour : hour)
    $('#t-m').text(minute < 10 ? "0" + minute : minute)
    $('#t-s').text(second < 10 ? "0" + second : second)
    // html =
    //     `<p class="bj" id="t-h">` + (hour < 10 ? "0" + hour : hour) + `</p>
    //         <p>:</p>
    //         <p class="bj" id="t-m">` + (minute < 10 ? "0" + minute : minute) + `</p>
    //         <p>:</p>
    //         <p class="bj" id="t-s">` + (second < 10 ? "0" + second : second) + `</p>`;
    // //填充元素
    // $(".countdown .time").html(html);
}

// 判断倒计时状态
function isDown(i, j) {
    var djs = new Date(i).getHours();
    var str = '',
        t = new Date().getHours();
    if (djs == t) {
        str = '本场结束还剩';
    } else if (djs > t) {
        str = '距离最近一场剩';
    }
    return str;
}

//滚动和列表事件
$(".rob ul").on("click", "li", function () {
    if ($(this).attr("data-id") != activeID) {
        activeID = $(this).attr("data-id"); //显示的时间分类id
        //alert("分类编号"+activeID);
        timeList.forEach(function (e) {
            if (e.id == activeID) { //点击的时间
                showTimeData(e); //根据时间分类，设置倒计时和商品列表 
            }
        });
        $('.onactive').removeClass('onactive');
        $("ul li p").css("font-size", "10px");
        $(this).find('p').css("font-size", "15px");
    }
});

/**
 *  根据时间分类 显示对应的商品列表
 * @param goods 所有产品列表
 * @param opt 一个时间分类
 */
function conterentlistDate(opt) {
    // console.log(conterentlistDate);

    // alert("没有商品数据");
    goodsListData.optsId = opt.id || goodsListData.optsId
    //商品列表请求
    $.ajax({
        url: http + "/plateGoods/getPlateGoodsList",
        type: "get",
        data: goodsListData,
        async: false,
        beforeSend: function (request) {
            request.setRequestHeader("userId", userInfo.userId);
            request.setRequestHeader("ticket", userInfo.ticket);
        },
        success: function (res) {
            if (res.success) {
                if (res.data.length > 0) {
                    //alert("商品个数："+showGoods.length);
                    goodsList = res.data
                    fullinlist(res.data, opt.startTime, opt.endTime, opt);
                } else {
                    //alert("没有商品");
                    $('.tail').html(''); //清空列表的商品
                }
            }
        }
    });
}

/**
 * 显示商品列表
 * @param i 要显示的商品列表
 * @param st 开始时间
 * @param et 结束时间
 * @param opt 时间分类 
 */

function fullinlist(showGoods, st, et, opt) {
    $('.tail').html(''); //清空列表的商品
    var html = '';
    showGoods.forEach((e) => {
        html += `<div data-id=` + e.sOGoods.id + ` class='robbed'>
        <div class='goodurl'>
           <img src="` + e.sOGoods.goodsImageUrl + `" alt=""/>
        </div>
           <div class="r-bcw">
               <img src="./image/rob_goods_icon_proprietary.png" alt="" class="jing"/>
               <p>` + e.sOGoods.goodsName + `</p>
             <div class="xiao">
                   <p>` + e.sOGoods.goodsDesc + `</p>
             </div>
             <div class="Alreadyrobbed" id="loadbar">
             <div class="bf" id="bf"><span class="yq"></span><p class="y">已抢</p><p class="percent">` + (e.stock == 0 ? "100" : (parseInt(e.validNum / (e.stock + e.validNum) * 100))) + `%</p></div>
                   <p class="subsidy">
                      <span>补贴</span>￥` + (parseInt(e.sOGoods.predictPromotion) / 100) + `
                   </p>
               <div class="money-m">
                    <span class="money">￥` + (parseInt(e.sOGoods.minGroupPrice) / 100) + `</span>
                    <span class="price">￥` + (parseInt(e.sOGoods.minNormalPrice) / 100) + `</span>
               </div>` +
            reservationRemind(opt, e) +
            `</div>
           </div>
  </div>`

    });
    $('.tail').html(html); //列表添加至商品列表div  
}


//进度条宽度计算
function calWidth() {
    $(".bf").each(function () {
        var yq = $(this).find(".yq");
        var number = $(this).find(".percent");
        var width = $(this).width() * parseFloat(number.text()) / 100; //计算宽度 
        yq.width(width);
    });
}
//判断预预约提醒.css(background:rgba(255, 255, 255, 1)==0?class="btn_b.css(background:#FF5349)
function reservationRemind(opt, goods) {
    //测试用，改变状态，1或2
    if (opt.buyStatus == 1 || opt.buyStatus == 4) {
        return `<button class="btn ` + (goods.stock == 0 ? "appo_remind" : "appo_done") + `" id="btn_btn"  onclick='toDetails(` + goods.id + `, ` + goods.stock + `, ` + goods.plateId + `)'>` + (goods.stock === 0 ? "已抢完" : "立即抢") + `</button>`;
    } else if (opt.buyStatus == 2) {
        return `<button id="btn" class="btn-Y` + (goods.reservationRsemindStatus == 0 ? "appo_remind" : "appo_done") + `" onclick='recive(this,` + JSON.stringify(opt) + `,` + JSON.stringify(goods) + `)'>` + (goods.reservationRemindStatus === 0 ? "预约提醒" : "预约成功") + `<p class="djtz">预约成功` + `</p>` + `</button>`;
    } else {
        return " ";
    }

}
//p:i.id,i:plateId,j:optsId,t:startTime,r:sOGoods.goodsName,o:reservationRemindStatus
function recive(ele, opt, goods) {
    // var t = setTimeout('alert("预约成功")', 5000)
    $(ele).find(".djtz").show();
    setTimeout(function () {
        $(ele).find(".djtz").hide();
    }, 5000);
    if (goods.reservationRemindStatus == 0) {
        reservation.startTime = Math.ceil(opt.startTime - 5 * 60)
        reservation.relationId = goods.plateId || 1
        reservation.relationSubId = goods.id
        reservation.pushText = "预约的" + goods.sOGoods.goodsName + "即将开抢，快去抢购吧"
        reservation.extrasparam = window.location.origin + '/active/goodsDetails/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType + '&id=' + goods.id
        console.log(reservation);
        $.ajax({
            url: http + "/reservationRemind/auth/addPlateGoods",
            type: "post",
            data: reservation,
            async: false,
            beforeSend: function (request) {
                request.setRequestHeader("userId", userInfo.userId);
                request.setRequestHeader("ticket", userInfo.ticket);
            },
            success: function (res) {
                if (res.code == 0) {
                    $("#btn").removeClass("appo_remind");
                    $("#btn").removeClass("appo_done");
                    // alert('预约成功')
                    // $("#btn").click(function () {
                    //     $(".djtc").toogle();
                    // })

                    // 刷新当前数据
                    conterentlistDate(opt);
                    reserveSuccess()
                } else {
                    alert(res.message)
                }
            }
        });
    }
}

function reserveSuccess() {
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.reserveSuccess();
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.reserveSuccess.postMessage({
                name: "reserveSuccess"
            });
        } catch (e) {
            console.log('与ios链接中断')
        }
    }

}

function toDetails(id, stock, plateId) {

    let data = {
        name: 'toDetails',
        url: window.location.origin + '/active/goodsDetails/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType + '&id=' + id + '&plateId=' + plateId
    }
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.toDetails(JSON.stringify(data));
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.toDetails.postMessage(data);
        } catch (e) {
            console.log('与ios链接中断')
        }
    }

}
//设置一个定时器
setInterval(function () {
    var t = new Date(),
        minute = t.getMinutes(),
        second = t.getSeconds();
    if ((minute == 0 || minute == 30) && second == 0) { //每个整点和半个小时加载一次商品
        timescrollBar(timeList)
    } else {
        return false;
    }
}, 1000);

// 获取时分秒
function getHour(i) {
    let hours = new Date(i).getHours(),
        minute = new Date(i).getMinutes();
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    return hours + ":" + minute
}

// 判断当前时间是否开始(i：抢购状态)
function isStayActive(i) {
    let str = ''
    if (i == 1) {
        str = '已开始';
    } else if (i == 2) {
        str = '未开始';
    } else if (i == 3) {
        str = '已结束';
    } else if (i == 4) {
        str = '抢购中';
    } else if (i == 5) {
        str = "预热";
    }
    return str;
}

// 设置字体颜色
function fontColor(i) {
    let str = '';
    if (i) {
        str = '';
    } else {
        str = '';
    }
    return str;
}

//开始/未开始状态
function htmlchange(i, st, et) {
    let html = '';
    if (i) {
        html = "<span class=''>" + getHour(st) + "</span>";
    } else {
        html = "<span class=''>" + getHour(st) + "</span>";
    }
    return html;
}

function setactive(i, j) {
    var n,
        t = new Date().getTime()
    if (i < t && t < j) {
        n = 0
    } else {
        n = 1
    }
    return n
}