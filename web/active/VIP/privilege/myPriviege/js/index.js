// 抢好货
var http = "https://xiaolvlan.walongkeji.com",

    userInfo = {
        userId: " ",
        ticket: " ",
        memberType: ""

    };
userInfo.userId = GetQueryString("userId");
userInfo.ticket = GetQueryString("ticket");
userInfo.memberType = GetQueryString("memberType");

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
    optsId: 0,
    memberType: 0,
    page: 0,
    pageSize: 10,
    rrStatus: 1
}
let reservation = {
    startTime: 0,
    relationld: 0,
    relationSubld: 0,
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
        console.log("ajaxtime");
        if (res.success) {
            timeList = res.data;
            timescrollBar(timeList);
        }
    }
});

function addOil() {
    let data = {
        name: 'addOil',
        url: 'http://open.czb365.com/redirection/todo?platformType=92652061&platformCode='
    }
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.addOil(JSON.stringify(data));
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.addOil.postMessage(data);
        } catch (e) {
            console.log('与ios链接中断')
        }
    }
}
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
            if (e.startTime < time && time < e.endTime) { //如果当前时间在 starttime 和 endtime之内，是开抢
                active_index = i + 1; //开抢的位置
                stayActiveStatus = true;
            } else if (time < e.startTime) {
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
                    id='` + (e.buyStatus == 4 ? "activeli" : "") + `'
                    onclick='changeRouter("toGrabgoodgoods" ,` + e.id + `)'>
                        <p>` + htmlchange(isrendr, e.startTime, e.endTime) + `</p>
                        <p class=` + fontColor(isrendr) + `>` + isStayActive(e.buyStatus) + `</p>
                        <img src="` + (e.buyStatus == 4 ? "./image/rob_good_top_icon.png" : " ") + `">
                    </li>`
        });
        $('.rob ul').html(html); //填充至 ul


        var activeOpt; //当前显示的时间
        if (active_index == 1 && stayActiveStatus) { //当前e为开抢
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


var interval;
//根据时间分类，设置倒计时和商品列表
function showTimeData(opt) {
    // console.log(opt);
    // console.log('-----');
    clearInterval(interval);
    //倒计时测试
    interval = setInterval(function () {
        opt.buyTime--;
        formatSeconds(opt.buyStatus, opt.buyTime)
    }, 1000);
    var html = `<img src="./image/rob_goods_icon_alarm_clock.png" alt="" />
                <p>` + (opt.buyStatus == 4 || opt.buyStatus == 1 ? "本场结束还剩" : "最近一场开始还剩") + `</p>`;
    $(".countdown .str").html(html);
    //显示商品列表
    conterentlistDate(opt);
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
    var h = hour < 10 ? "0" + hour : hour
    var m = minute < 10 ? "0" + minute : minute
    var s = second < 10 ? "0" + second : second
    $('#t-h').text(h)
    $('#t-m').text(m)
    $('#t-s').text(s)
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

// //滚动和列表事件
// $(".rob ul").on("click", "li", function() {
//     if ($(this).attr("data-id") != activeID) {
//         activeID = $(this).attr("data-id"); //显示的时间分类id
//         //alert("分类编号"+activeID);
//         timeList.forEach(function(e) {
//             if (e.id == activeID) { //点击的时间
//                 showTimeData(e); //根据时间分类，设置倒计时和商品列表
//             }
//         });
//         $('.onactive').removeClass('onactive');
//         // $("ul li p").css("font-size", "10px");
//         // $(this).find('p').css("font-size", "15px");
//     }
// });

/**
 *  根据时间分类 显示对应的商品列表
 * @param goods 所有产品列表
 * @param opt 一个时间分类
 */
function conterentlistDate(opt) {
    // alert("没有商品数据");
    goodsListData.optsId = opt.id
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
            console.log("ajaxgoods");
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
                      补贴￥` + (parseInt(e.sOGoods.predictPromotion) / 100) + `
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
//判断预预约提醒
function reservationRemind(opt, goods) {
    console.log(goods);
    //测试用，改变状态，1或2
    if (opt.buyStatus == 1 || opt.buyStatus == 4) {
        return `<button class="btn ` + (goods.stock == 0 ? "appo_remind" : "appo_done") + `" id="btn_btn"  onclick='toDetails(` + goods.id + `, ` + goods.stock + `, ` + goods.plateId + `)'>` + (goods.stock == 0 ? "已抢完" : "立即抢") + `</button>`;
    } else if (opt.buyStatus == 2) {
        return `<button id="btn" class="btn-Y ` + (goods.reservationRsemindStatus == 0 ? "appo_remind" : "appo_done") + `" onclick='recive(` + JSON.stringify(opt) + `,` + JSON.stringify(goods) + `)'>` + (goods.reservationRemindStatus == 0 ? "预约提醒" : "预约成功") + `</button>`;
    } else {
        return " ";
    }
}

function recive(i, j) {
    if (i.reservationRemindStatus == 0) {
        reservation.startTime = Math.ceil(j.startTime - 5 * 60)
        reservation.relationld = i.plateId || 1
        reservation.relationSubld = i.optsId
        reservation.pushText = "预约的" + i.sOGoods.goodsName + "即将开抢，快去抢购吧"
        reservation.extrasparam = window.location.origin + '/active/goodsDetails/index.html?userId=' + userId + '&ticket=' + ticket + '&memberType=' + memberType + '&id=' + i.id
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
                    alert('预约成功')
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
    if ((minute == 0 || minute == 30) && second == 0) {
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
        str = ' ';
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
//时间
function setGoodsFixed() {
    //获取要定位元素距离浏览器顶部的距离
    var robTopo = $(".rob").offset().top; //时间 与页面顶部距离
    var goodsTop = $(".tail").offset().top
    //时间-滚动事件
    $(window).scroll(function () {
        var windowScroll = $(this).scrollTop(); //获取滚动条的滑动距离
        var goodsHeight = $(".tail").height(); //抢好货商品的高度
        var robHeight = $(".rob").height(); //抢好货商品的高度
        //滚动条滑动的距离大于定位元素距离浏览器顶部的距离，就固定，反之就不固定
        if (windowScroll >= robTopo && windowScroll <= (goodsTop + goodsHeight - robHeight)) { //在抢好货和好货返场时间固定，其他不固定
            $(".rob").css({
                "position": "fixed", //固定时间
                "top": 0
            });
            $(".countdown,.tip").hide(); //隐藏倒计时

        } else {
            $(".rob").css({
                "position": "static" //解除固定时间
            });
            $(".countdown,.tip").show(); //显示倒计时
        }
    })


}


$(document).ready(function () {
    if (userInfo.userId || userInfo.ticket) {
        $('.login').show()
        $.ajax({
            type: "get",
            url: http + '/user/auth/getMemberSystem',
            beforeSend: function (request) {
                request.setRequestHeader('userId', userInfo.userId);
                request.setRequestHeader('ticket', userInfo.ticket);
            },
            success: function (res) {
                if (res.code == 0) {
                    $('.topBg>img').attr('src', res.data.headImg)
                    $('.username').text(res.data.nickName)
                    let level = '',
                        viptitle = '';
                    userInfo.memberType = res.data.memberType
                    res.data.memberType === 1 ? $('.noVip').show() : $('.vip').show();
                    switch (res.data.memberType) {
                        case 2:
                            //vip  
                            level = './image/level_vip.png'
                            viptitle = formatCountTime(res.data.remainTime)
                            break;
                        case 3:
                            //panter
                            level = './image/level_three.png'
                            viptitle = '已是合伙人，快去享受权益吧'
                            break;
                        case 21:
                            //临时
                            level = './image/level_sevendays.png'
                            viptitle = formatCountTime(res.data.remainTime)
                            $('.usertype').css({ 'width': '2.277778rem', "height": '0.583333rem' })
                            break;

                        default:
                            level = './image/level_one.png'
                            viptitle = '升级小绿蓝VIP获得专属特权'
                            break;
                    }
                    $('.usertype').attr('src', level)
                    $('.vipTitle').text(viptitle)
                    // 页面首次加载定位在新人专区
                    $(document).scrollTop($('.newPersonGift').offset().top);
                    goodsBackList()
                    $.ajax({
                        url: http + "/reservationRemind/auth/addPlateGoods",
                        type: "post",
                        data: reservation,
                        success: function (res) {
                            if (res.success) {
                                successfulreservation();
                            }
                        }
                    })
                    //时间分类请求      
                    $.ajax({
                        url: http + "/goodsOpts/getGoodsOptsList",
                        type: "get",
                        data: goodsClassData,
                        success: function (res) {
                            if (res.success) {
                                timeList = res.data;
                                timescrollBar(timeList);
                                setGoodsFixed()
                            }
                        }
                    });


                }

            },
        });


    } else {
        $('.nologin').show()
        $('.nologin').css('height', $(document).height() + 'px')
    }
})

function goodsBackList() {
    $.ajax({
        type: 'get',
        url: http + '/plateGoods/getPlateGoodsList',
        data: {
            plateId: 4,
            memberType: 1
        },
        beforeSend: function (request) {
            request.setRequestHeader('userId', userInfo.userId);
            request.setRequestHeader('ticket', userInfo.ticket);
        },
        success: function (res) {
            if (res.code == 0) {
                var html = ''
                res.data.forEach((e, i) => {
                    console.log(e);

                    html += `
                    <li onclick='toDetails(` + e.id + `, ` + e.stock + `,` + e.plateId + `)'>
                    <img src="` + e.sOGoods.goodsThumbnailUrl + `" alt="">
                    <div>
                        <div>
                            <img src="` + goodsType(e.sOGoods.platformType).imgSrc + `" alt="">
                            <p>` + e.sOGoods.goodsName + `</p>
                        </div>
                        <div class="_price">
                            <p>￥<span class="minGroupPrice">` + (e.sOGoods.minGroupPrice / 100) + `</span></p>
                            <p>
                                <span class="minNormalPrice">` + (e.sOGoods.minNormalPrice / 100) + `</span>
                                <em class='_line'></em>
                            </p>
                        </div>
                        <p>月售` + e.validNum + `件</p>
                        <div class="subsidies">
                            <p style='display:` + (e.sOGoods.platformType == 3 ? "block" : "none") + `'>自营</p>
                            <div style='display:` + (e.sOGoods.platformType == 3 ? "none" : "block") + `'>` + (e.sOGoods.couponDiscount || 0) + `元</div>
                            <p>
                                补贴￥` + (e.sOGoods.predictPromotion / 100 || 0) + `
                            </p>
                        </div>
                    </div>
                </li>
                    `
                })
                $('.goodsBack ul').append(html);
                let h = ($('._price p:nth-child(2)').height() - $('._line').height()) / 2
                $('._line').css('top', h + 'px')
            }
        }
    })
}
// 格式化到期时间
function formatCountTime(t) {
    var date = new Date(parseInt(new Date().getTime() + t * 1000))
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var currentTime = year + "-" + month + "-" + day + '到期';
    return currentTime
}

function goodsType(opt) {
    console.log(opt);

    let data = {
        imgSrc: ''
    }
    switch (opt) {
        case 0:
            data.imgSrc = './image/home_tab_taobao_small.png'
            break;
        case 1:
            data.imgSrc = './image/home_tab_tmall_small.png'
            break;
        case 2:
            data.imgSrc = './image/home_tab_pin_small.png'
            break;
        case 3:
            data.imgSrc = './image/rob_goods_icon_proprietary.png'
            break;
    }
    console.log(data);

    return data
}

function tologin() {

    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.tologin();
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.tologin.postMessage({
                'name': "tologin",
            });
        } catch (e) {
            console.log('与ios链接中断')
        }
    }
}

function changeRouter(opt, Grabgoodgoods_id) {
    console.log(opt);
    // alert(222);
    let u = ''
    switch (opt) {
        case 'toPrivilegeCenter':
            u = '/active/VIP/privilege/privilegeCenter/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType
            break;
        case 'setupVip':
            u = '/active/VIP/privilege/privilegeCenter/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType
            break;
        case 'setup':
            u = '/active/MissionCenter/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType
            break;
        case 'toVipGift':
            u = '/active/VIP/gift/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType
            break;
        case 'addtime':
            u = '/active/MissionCenter/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType
            break;
        case 'toNewbornZone':
            u = '/active/MissionCenter/NewbornZone.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType
            break;
        case 'toGrabgoodgoods':
            u = '/active/Grabgoodgoods/index.html?userId=' + userInfo.userId + '&ticket=' + userInfo.ticket + '&memberType=' + userInfo.memberType + '&Grabgoodgoods_id=' + Grabgoodgoods_id
            break;
    }
    let data = {
        name: 'changeRouter',
        url: window.location.origin + u
    }
    console.log(data.url);

    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.changeRouter(JSON.stringify(data));
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.changeRouter.postMessage(data);
        } catch (e) {
            console.log('与ios链接中断')
        }
    }
}




function toHGTS() {
    let data = {
        name: 'toHGTS',
        url: 'http://tq.365taoquan.cn/seller/app/classify?machineCode=' + userInfo.userId + '&agentId=12'
    }

    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.toHGTS(JSON.stringify(data));
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.toHGTS.postMessage(data);
        } catch (e) {
            console.log('与ios链接中断')
        }
    }
}