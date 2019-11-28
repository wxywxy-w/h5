// 活动说明 type:模态框类型
function openModel(type, ctx) {
    if (type == 0) {
        let c = ctx == '' ? '您已是老用户<br>留点福利给新人吧！' : ctx
        $('.rules-title').text('十分抱歉').siblings('.unGet').find('p').html(c)
        $('.unGet').css('display', 'block').siblings('ul').css('display', 'none').siblings('.closemodel').css('display', 'block').siblings('.rules-footer').children('.rules-btn-c').css('display', 'none').siblings('.rules-btn-o').css('display', 'block')
    } else if (type == 1) {
        $('.rules-title').text('活动说明')
        $('.unGet').css('display', 'none').siblings('ul').css('display', 'block').siblings('.closemodel').css('display', 'none').siblings('.rules-footer').children('.rules-btn-c').css('display', 'block').siblings('.rules-btn-o').css('display', 'none')
    } else if (type == 3) {
        $('.rules-title').text('恭喜你').siblings('.unGet').find('p').html('领取成功！')
        $('.unGet').css('display', 'block').siblings('ul').css('display', 'none').siblings('.closemodel').css('display', 'none').siblings('.rules-footer').children('.rules-btn-c').css('display', 'block').siblings('.rules-btn-o').css('display', 'none')
    } else {
        return false
    }
    var top = $(window).height() * 0.2
    var left = ($(window).width() - $('.maskbox').width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    let h = $(document.body).height()
    $('.maskbox').css({ 'top': top + scrollTop, 'left': left + scrollLeft }).parents('.rules-block').css('height', h).fadeIn()
}

function closeModel() {
    $('.rules-block').fadeOut()

}
var http = 'https://xiaolvlan.walongkeji.com',
    userId = '',
    ticket = '',
    timer = null,
    isf = true;

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return "";
}
userId = GetQueryString('userId');
ticket = GetQueryString('ticket');
// 获得领取记录信息
function getGiftReceiveLog(type) {
	//window.alert("sometext"+userId+ticket);
    if (type && type == 1) {
        $.ajax({
			
            type: "get",
            dataType: "json",
            async: false,
            url: http + "/giftReceiveLog/auth/get",
            beforeSend: function(request) {
                request.setRequestHeader("userId", userId);
                request.setRequestHeader("ticket", ticket);
            },
            data: {
                type: 1
            },
            success: function(data) {
                if (data.code == 0) {
                    switch (data.data.status) {
                        case 1:
                            //未领取(前往领取)

                            break;
                        case 2:
						  //  window.alert("sometext");
                            //已领取（有效）进入V3页面
                            toggleShowV3Page(data.data.surplusTime)
                            break;
						
                        case 3:
						     getV3Style();
                            //已领取（失效）提示已领取
                           // openModel(0)
                            break;
                        case 5:
						    getV3Style();
                            //活动已结束
                           // openModel(0, '活动已结束')
                            break;
                        default:
						    getV3Style();
                            // 无法领取
                           // openModel(0, '领取失败')
                            break;
                    }
                }
            },
            error: function() {
                alert('错误');
            }
        });
    }

}

// 领取礼包
function getGift() {
    $.ajax({
        type: "post",
        dataType: "json",
        async: false,
        url: http + "/giftReceiveLog/auth/newUserTemporaryUpgrade",
        beforeSend: function(request) {
            request.setRequestHeader("userId", userId);
            request.setRequestHeader("ticket", ticket);
        },
        success: function(data) {
            if (data.code == 0) {
                openModel(3)
                getGiftReceiveLog(1)
            } else {
                openModel(0, data.message)
            }
        },
        error: function() {
            alert('错误');
        }
    });
}
// t:倒计时
function toggleShowV3Page(t) {
	 showV3Style()
    if (timer && timer !== null) {
        clearInterval(timer)
    }
    timer = setInterval(() => {
        if (t && t > 1000) {
            t = t - 1000
            chartCountDown(t)
        } else {
            clearInterval(timer)
            return false
        }
    }, 1000);
   
}

function chartCountDown(t) {
    var days = parseInt(t / (1000 * 60 * 60 * 24));
    var hours = parseInt((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((t % (1000 * 60 * 60)) / (1000 * 60));
    $('.countdown .day').text(days)
    if (hours === 0) {
        $('.countdown .mun_b').text('0').siblings('.mun_s').text('0')
    } else if (hours > 0 && hours < 10) {
        $('.countdown .mun_b').text('0').siblings('.mun_s').text(hours)
    } else if (hours >= 10 && hours < 24) {
        var _hours = hours.toString().split('')
        $('.countdown .mun_b').text(_hours[0]).siblings('.mun_s').text(_hours[1])
    }
    if (minutes === 0) {
        $('.countdown .min_b').text('0').siblings('.min_s').text('0')
    } else if (minutes > 0 && minutes < 10) {
        $('.countdown .min_b').text('0').siblings('.min_s').text(minutes)
    } else if (minutes >= 10 && minutes < 60) {
        var minutes = minutes.toString().split('')
        $('.countdown .min_b').text(minutes[0]).siblings('.min_s').text(minutes[1])
    }
}
// 未进入v3的style
function getV3Style() {
    $('.getGiftContent ._bg').attr('src', './image/new_activitie_background_banner.png')
    $('.getV3').css('display', 'block').siblings('.showV3').css('display', 'none')
    $('.showSomeGift').css('display', 'none')
    $('.whoWork').css('display', 'none')
}
//进入V3的style
function showV3Style() {
    $('.getGiftContent ._bg').attr('src', './image/new_activitie_background_banner.png')
    $('.getV3').css('display', 'none').siblings('.showV3').css('display', 'flex')
    $('.showSomeGift').css('display', 'flex')
    $('.whoWork').css('display', 'block')
}

//-----------页面点击事件处理------------------
//跳转大转盘
function game() {
    window.location.href = window.location.origin + '/game/game.html?userId=' + userId + '&ticket=' + ticket
}
//与原生交互
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

function togiftBag() {
    window.location.href = window.location.origin + '/newPersonGift/giftBag/index.html?userId=' + userId + '&ticket=' + ticket
}

function toOtherActive() {
    window.location.href = window.location.origin + '/active/taskcenter/index.html?userId=' + userId + '&ticket=' + ticket
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
        } catch (e) {}
    }
}

$(document).ready(function() {
	//window.alert("sometext"+userId+ticket);
	 getGiftReceiveLog(1)
   // getV3Style()
        
});