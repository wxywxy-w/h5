var https = 'https://xiaolvlan.walongkeji.com/',
    userId = '',
    ticket = '';
// 今日是否签到
var ischeckin = false
    // 签到文案
var checkin_tip_text
    // 签到参数
var checklogdata
    // 获取url参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}
userId = GetQueryString("userId");
ticket = GetQueryString("ticket");

function getCheckinLog() {
    $.ajax({
        type: "get",
        url: https + 'signIn/auth/getSignInLog',
        headers: {
            'userId': userId,
            'ticket': ticket
        },
        success: function(response) {
            // var response = JSON.parse(response)
            if (response.success) {
                // 判断今日是否已签到
                ischeckin = response.data.signInLog.split('')[new Date().getDate() - 1] == 1 ? true : false
                checklogdata = ''
                checklogdata = JSON.stringify(response.data)
                checklogdata = JSON.parse(checklogdata)
                console.log(checklogdata)
                    // 填充页面数据
                fillData(checklogdata)
            } else {
                console.log(response.message)
            }
        }
    });
}
getCheckinLog()

function fillData(data) {
    checkin(ischeckin, data.continuousSignInNum, data.isContinuity)
    chartsChnkTable(data.nowDate, data.signInLog)
    chartsProgres(data.continuousSignInNum, data.signInSilver)
    $('.some_doMI').text(data.signInSilver[(data.continuousSignInNum % 7) - 1])

}





// 绘制签到进度条(len:连续签到的天数 arr:do米奖励的数组)
function chartsProgres(len, arr) {
    var a = (len / 8) * 100
    $('.charts').animate({
        width: a + "%"
    }, 1000);
    // 填写do米
    $.each($('.integral'), function(i, item) {
        $.each(arr, function(index, el) {
            if (i == index) {
                $(item).text(el)
            }
        })
    });
    // 硬币，礼物图标展示
    $.each($('.slivecoin'), function(i, item) {
            var src = (i + 1) <= len ? './img/lightmoney.png' : './img/money.png'
            var actspan = (i + 1) <= len ? 'actspan' : 'defaultspan'
            $(this).attr('src', src).prev().addClass(actspan)
        })
        // 奖字高亮
    if (len >= 7) {
        $('.jiang').css('background', 'rgba(255,159,28,1)')
    } else {
        $('.jiang').css('background', 'rgba(255,207,141,1)')
    }

}
// 判断今日是否签到(i:今日是否签到，len:连续签到的天数,checkstatus:签到的状态)
function checkin(i, len, checkstatus) {
    if (i) {
        $('.checkin_btn > span').text('已签到')
            // 切换签到图片 .prev().attr('src', './img/success.png')
    } else {
        $('.checkin_btn > span').text("签  到")
            // 切换签到图片 .prev().attr('src', './img/sign in.png')
    }
    checkin_tip_text = checkstatus == 2 ? '签到中断，需重新累计' : checkstatus == 0 ? '累计签到7天有惊喜噢' : '累计签到' + len + '天，继续加油！'
    $('.checkin_tip').text(checkin_tip_text)
}

// 画出签到表格 传入参数（i当前月份 ，o该月签到记录）
function chartsChnkTable(i, o) {
    // 清除TD&TR
    $('tbody').children().remove()
        // 当前月份
    $('.calendar__banner--month').text(i)
        // 获取单月第一天是周几
    var datearr = o.split('')
    var weekday = new Date(new Date().setDate(1)).getDay();
    for (let index = 0; index < weekday; index++) {
        datearr.unshift('0')
    }
    // 创建tr
    for (let index = 0; index < datearr.length; index++) {
        var id
        if (index % 7 == 0) {
            id = index / 7
            var tr = $("<tr id=" + id + "></tr>")
            $("tbody").append(tr)
        }
    }
    // 创建td
    var trarr = $('tbody tr')
    var tdclass, tdtext; //字体样式,字体文本 
    for (let index = 0; index < datearr.length; index++) {
        let count = (index + 1) / 7
        for (let index2 = 0; index2 < trarr.length; index2++) {
            var e = Number(trarr[index2].id);
            if (e < count && count <= (e + 1)) {
                switch (datearr[index]) {
                    case '2':
                        tdclass = 'leeave_out_calendar__day__cell'
                        break;
                    case '1':
                        tdclass = 'active_calendar__day__cell'
                        break;
                    default:
                        tdclass = ''
                        break;
                }
                tdtext = (index + 1) - weekday <= 0 ? "" : (index + 1) - weekday
                var td = $("<td class='calendar__day__cell'><span class=" + tdclass + ">" + tdtext + "</span></td>>")
                $(trarr[index2]).append(td)
            }
        }

    }
}
// 领取礼物
function getgift() {
    if (checklogdata.continuousSignInNum >= 7) {
        model_box_show()
        $('.checkinContent').text('幸运转盘抽奖机会一次')
        $('.toDraw').css('display', 'block').siblings('.toShop').css('display', 'none')
    }
}
// 签到按钮
function checkinbtn() {

    $('.modelbox').css('height', (document.body.clientHeight + 'px'))
    if (!ischeckin) {
        checkinAjax()
    } else {
        console.log('今日已签到')
    }
}
// 签到请求
function checkinAjax() {
    $.ajax({
        type: "post",
        url: https + 'signIn/auth/signIn',
        headers: {
            'userId': userId,
            'ticket': ticket
        },
        success: function(response) {
            if (response.success) {
                $('.checkinContent').text(response.data.silverText)
                    // 判断前往商城还是大转盘
                response.data.lotteryDrawStatus == 0 ? $('.toDraw').css('display', 'none').siblings('.toShop').css('display', 'block') : $('.toDraw').css('display', 'block').siblings('.toShop').css('display', 'none')
                model_box_show()
                getCheckinLog()
            } else {
                alert(response.message)
            }
        }
    });

}
// 打开遮罩层
function model_box_show() {
    $('.modelbox').fadeIn()
}
// 关闭遮罩层
function model_box_close() {
    $('.modelbox').fadeOut()
}
// 抽奖跳转
function toDraw() {
    window.location.href = 'http://test.laifadan.com/game/game.html?userId=' + userId + '&ticket=' + ticket
}
// 去商城兑奖
function toShop() {
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.toShop();
        } catch (e) {

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.toShop.postMessage({
                'name': 'toShop'
            });
        } catch (e) {

        }
    }

}
// 分享二维码
function shareQrCode() {
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.shareQrCode();
        } catch (e) {

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.shareQrCode.postMessage({
                'name': 'shareQrCode'
            });
        } catch (e) {

        }
    }


}
// 分享商品
function shareGood() {
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.shareGood();
        } catch (e) {

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.shareGood.postMessage({
                'name': 'shareGood'
            });
        } catch (e) {

        }
    }


}
// 完成订单
function finnlyOrder() {
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.finnlyOrder();
        } catch (e) {

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.finnlyOrder.postMessage({
                'name': 'finnlyOrder'
            });
        } catch (e) {

        }
    }


}