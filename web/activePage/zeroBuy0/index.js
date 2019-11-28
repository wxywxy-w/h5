var
// http = 'https://xiaolvlan.walongkeji.com',
    http = "https://xiaolvlan.walongkeji.com",
    listdata = [],
    userInfo = {
        userId: '',
        ticket: ''
    },
    toNativeData = {},
    activeID = null


function getUserInfo(i) {
    if (i != "{}") {
        userInfo.userId = i.userId,
            userInfo.ticket = i.ticket
    }
}


// 画出滚动条
function chartScrollBar(i) {
    if (i.length > 0) {
        var _html = '',
            _t = new Date().getTime(),
            active_index = 0, // 正在抢购的位置
            stayActiveStatus = false, // 是否正在抢购中
            unstart_index = []; //未开始数组（存入未开始的位置）

        i.forEach((_e, _i) => {
            var isrendr = false
            if (_e.startTime < _t && _t < _e.endTime) {
                active_index = _i + 1
                stayActiveStatus = true
            } else if (_t < _e.startTime) {
                unstart_index.push(_i + 1)
                stayActiveStatus = false
            }
            if ((active_index !== 0 && stayActiveStatus) || (active_index == 0 && !stayActiveStatus && unstart_index.length == 1)) {
                isrendr = true
            }
            _html += `
                <li  data-id=` + _e.id + ` class='scrollevent')'>
                <img src="./image/line.png" alt="">
                <div>
                    <p>` +
                htmlchange(isrendr, _e.startTime, _e.endTime) +
                `        
                    </p>
                    <p class='` + fontColor(isrendr) + `'>
                        ` + isStayActive(_e.startTime, _e.endTime) + `
                    </p>
                </div>
            </li>
            `
        })

        $('.scrollbar ul').html(_html)
            // 根据活动列表定位滚动条
            // 如果有正在抢购的就定位到真在抢购，如果没有正在抢购的就定位到最近时间
        let body_w = parseInt($('body').css('width').slice(0, -2)),
            scrollBar_w = parseInt($('.scrollbar').find('li').css('width').slice(0, -2)),
            block_w = active_index == 0 ? unstart_index[0] : active_index;

        if ((scrollBar_w * block_w) > body_w) {
            let _w = (scrollBar_w * block_w) - (body_w / 2) - (scrollBar_w / 2)
            $('.scrollbar ul').scrollLeft(_w)
        } else {
            //默认展示第一条
        }


    }
}
// 存储列表对应的数据
function chartListData(i) {
    var has_active_unstart = false;
    listdata = i;
    // 找到当前正在抢购的时间数据并展示如果没有正在抢购就是显示第一条未开始数据
    for (let index = 0; index < i.length; index++) {
        const element = i[index];
        var t = new Date().getTime()
        if (element.startTime < t && t < element.endTime || t < element.startTime) {
            fullinList(element.items, element.startTime, element.endTime, element.id)
            has_active_unstart = true
            break
        }
    }
    // 如果没有正在抢购或未开始的就显示最近的一条未开始抢购
    if (!has_active_unstart) {
        fullinList(i[0].items, i[0].startTime, i[0].endTime, i[0].id)
    }
}
// 滚动条和列表联动事件
$(".scrollbar ul").on("click", "li", function() {
    if ($(this).attr("data-id") !== activeID) {
        activeID = $(this).attr("data-id")
        listdata.forEach((_e) => {
            if (_e.id == $(this).attr("data-id")) {
                fullinList(_e.items, _e.startTime, _e.endTime, _e.id)
            }
        })
        $('.onactive').removeClass('onactive')
        $('.scrollevent>div').find('p').css('color', '#fff').find('span').css('color', '#fff')
        $(this).find('p').css('color', '#f9ff04').find('span').css('color', '#f9ff04')
    }

});
// i:列表数据 st:开始时间 et:结束时间
function fullinList(i, st, et, _id) {
    $('.underblock ul').html('')
    var _html = ''
    i.forEach((e) => {
        _html +=
            `<li >
            <div class='goodsImg'>
                <img src="` + e.goodsThumbnailUrl + `" alt="">
            </div>
            <div class="content">
                <p>` + e.goodsName + `</p>
                <p>` + e.goodsDesc + `</p>
                <div class='_c'>
                    <p>限购一份</p>
                    <div class='bitcoin' style='display:` + (setactive(st, et) == 0 ? "block" : "none") + `'>
                        <img src="./image/bitcoin.png" alt="">
                        <span>` + glodenStatus(e.minNormalPrice, e.couponDiscount, e.promotionRate, st, et) + `</span>
                    </div>
                    <div class='domi' style='display:` + (setactive(st, et) == 0 ? "block" : "none") + `'>
                        <img src="./image/domi.png" alt="">
                        <span>` + domiStatus(e.minNormalPrice, e.couponDiscount, e.promotionRate, st, et) + `</span>
                    </div>
                </div>
                <div class='_b'>
                    <div>
                        <p>
                            <span>` + Math.floor(Math.random() * 9000 + 1000) + `</span>
                            <span>人已领</span>
                        </p>
                        <div>
                            <div>
                                <p>
                                   <span>` + (setactive(st, et) == 0 ? "" : "补贴") + `</span>
                                   ￥` + ((parseInt(e.minNormalPrice) - parseInt(e.couponDiscount)) / 100) + `</p>
                            </div>
                            <div style='display:` + (setactive(st, et) == 0 ? "block" : "none") + `'>
                                 <span class='aftertitck'>￥` + (parseInt(e.minNormalPrice) / 100) + `</span>
                                <div class='deteleline'></div>
                            </div>
                        </div>

                    </div>
                    <button  onclick='getTicket(` + e.goodsId + `)' 
                    data-activeId = ` + _id + ` 
                    data-goodsId = ` + e.goodsId + ` 
                    data-id=` + setactive(st, et) + ` 
                    data-goodsName=` + e.goodsName + ` 
                    data-platformType =` + e.platformType + ` 
                    data-price =` + (parseInt(e.minNormalPrice) - parseInt(e.couponDiscount)) / 100 + `
                    data-bitcoin =` + ((parseInt(e.minNormalPrice) - parseInt(e.couponDiscount)) * parseInt(e.promotionRate) / 10000).toFixed(0) + ` 
                    data-domi =` + ((parseInt(e.minNormalPrice) - parseInt(e.couponDiscount)) - ((parseInt(e.minNormalPrice) - parseInt(e.couponDiscount)) * parseInt(e.promotionRate) / 10000)).toFixed(0) + ` 
                    class='` + setactiveclass(st, et) + ` pullDown ' >
                        ` +
            isStayActive(st, et) +
            `
                    </button>
                </div>
            </div>
        </li>
        `
    })
    $('.underblock ul').html(_html)
    setLine()
}

function glodenStatus(j, k, l, st, et) {
    let
        t = new Date().getTime()
    if (l > 0) {
        if (t < st) {
            return '0';
        }
        if (t > et) {
            return '0'
        }
        return Math.floor((parseInt(j) - parseInt(k)) * parseInt(l) / 10000)
    } else {
        return '0';
    }

}

function domiStatus(j, k, l, st, et) {
    let
        t = new Date().getTime()
    if (l > 0) {
        if (t < st) {
            return '0';
        }
        if (t > et) {
            return '0'
        }
        return Math.floor(((parseInt(j) - parseInt(k)) - ((parseInt(j) - parseInt(k)) * parseInt(l) / 10000)))
    } else {
        return '0';
    }

}
// 立即领券
function getTicket(i) {
    for (let index = 0; index < $('button').length; index++) {
        const element = $('button')[index];
        if ($(element).attr('data-id') == 0) {
            if ($(element).attr('data-goodsId') == i) {
                let data = {
                        'name': "toOrderIn",
                        'goodsId': $(element).attr('data-goodsId'),
                        'goodsName': $(element).attr('data-goodsName'),
                        'platformType': $(element).attr('data-platformType'),
                        'activeId': $(element).attr('data-activeId')
                    }
                    // let _data = JSON.stringify(data)
                    // if (/android/i.test(navigator.userAgent)) {
                    //     try {
                    //         window.android.getTicket(_data);
                    //     } catch (e) {
                    //         console.log('与android链接中断')
                    //     }
                    // } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
                    //     try {
                    //         window.webkit.messageHandlers.getTicket.postMessage(data);
                    //     } catch (e) {
                    //         console.log('与ios链接中断')
                    //     }
                    // }
                toNativeData = data
                showModel($(element).attr('data-price'), $(element).attr('data-bitcoin'), $(element).attr('data-domi'))
            }
        }
    }
}

// 设置一个定时器：每次遇到00 10 20 30 40 50 重绘数据表
setInterval(() => {
    var t = new Date()
        // 获取判断现在是否为整时
    let h = t.getHours(),
        m = t.getMinutes(),
        s = t.getSeconds()

    if ((m == 0 || m == 30) && s == 0) {
        chartScrollBar(listdata)
        chartListData(listdata)
    } else {
        return false
    }
}, 1000);
// 显示弹出框并设置弹出框位置 c:券后价格 t:金币 x:domi 
function showModel(c, t, x) {
    // $('.ctx').text(ctx)
    var top = $(window).height() * 0.2
    var left = ($(window).width() - $('.box').width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    $('._price').text(c)
    $('._coin').text(t)
    $('._domi').text(x)
    $('.modelbox').show().find('.box').css({ 'top': top + scrollTop, left: left + scrollLeft }).fadeIn()
}
// 关闭弹窗
function hideModel() {
    $('.box').fadeOut().parents('.modelbox').hide()
}
//去下单
function toOrderIn() {

    let _data = JSON.stringify(toNativeData)
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.toOrderIn(_data);
        } catch (e) {
            console.log('与android链接中断')

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.toOrderIn.postMessage(toNativeData);
        } catch (e) {
            console.log('与ios交互-----')
            console.log('与ios链接中断')
        }
    }


}

// 过滤器
// 获取月日
function getDay(i) {
    let
        month = new Date(i).getMonth() + 1,
        date = new Date(i).getDate()
    return month + '.' + date
}
// 获取时分秒
function getHour(i) {
    let
        hours = new Date(i).getHours(),
        minute = new Date(i).getMinutes()
    if (hours < 10) { hours = '0' + hours; }
    if (minute < 10) { minute = '0' + minute; }
    return hours + ":" + minute
}
// 判断当前时间是否开始(i：开始的时间戳 j:结束的时间戳)
function isStayActive(i, j) {
    let
        str = '',
        t = new Date().getTime()
    if (i < t && t < j) {
        str = '抢购中'
    } else if (t < i) {
        str = '未开始'
    } else if (t > j) {
        str = '已结束'
    }
    return str
}
// 设置字体颜色
function fontColor(i) {
    let
        str = '';
    if (i) {
        str = 'onactive'
    } else {
        str = ' '

    }
    return str

}
// i:是否高亮
function htmlchange(i, st, et) {
    let
        html = '';

    if (i) {
        html = `<span class='` + fontColor(i) + `' style='margin-right:0 !important'>` + getHour(st) + `</span>&nbsp-&nbsp
        <span class='` + fontColor(i) + `'>` + getHour(et) + `</span>`
    } else {
        html = `<span class='` + fontColor(i) + `'>` + getDay(st) + `</span>
        <span class='` + fontColor(i) + `'>` + getHour(st) + `</span>`

    }
    return html

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

function setactiveclass(i, j) {
    var n,
        t = new Date().getTime()
    if (i < t && t < j) {
        n = 'activebtn'
    } else {
        n = 'unactivebtn'
    }
    return n
}

function setLine() {
    // 设置券后价横线的位置
    $('.deteleline').css('top', ($('.deteleline').parent().height() / 3 * 2))
}

$(document).ready(function() {
    $.ajax({
        type: "get",
        url: http + "/goodsRush/getGoodsRushList",
        success: function(res) {
            if (res.success) {
                chartScrollBar(res.data)
                chartListData(res.data)
            } else {}
        }
    });
})