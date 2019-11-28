var http = 'https://xiaolvlan.walongkeji.com',
    userInfo = {
        "userId": '',
        "ticket": ""
    },
    clipboard = new ClipboardJS('.clipboard');

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}
userInfo.userId = GetQueryString('userId')
userInfo.ticket = GetQueryString('ticket')

$('.clipboard').attr('data-clipboard-text', userInfo.userId)

clipboard.on('success', function(e) {
    showModel('复制成功!')
    e.clearSelection();
});

clipboard.on('error', function(e) {
    showModel('复制失败!')
});
// >>>>>>>>>>>>>>>>>>>>>>提示框<<<<<<<<<<<<<<<<<<<<<<<
function showModel(ctx) {
    $('.ctx').text(ctx)
    var top = ($(window).height() - $('.tipbox').height()) / 2;
    var left = ($(window).width() - $('.tipbox').width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    $('.tipbox').css({ position: 'absolute', 'top': top + scrollTop, left: left + scrollLeft }).show();
    setTimeout(() => {
        $('.tipbox').hide()
    }, 1500);
}
// 填写用户邀请信息
function fullinUserInvite(i) {
    $('.info .inviteNum').html(i.inviteNum)
    $('.info .estimateReward').html(i.estimateReward)
    $('.info .settleReward').html(i.settleReward)
    $('.usercode').html(userInfo.userId)
}
// 填写邀请排行榜
function fullinInviteRank(i) {
    // 我的排名
    $('.myrank .rownum').html(i.theChatsByUserId.rownum)
    $('.myrank .mineHead').attr('src', i.theChatsByUserId.headImg)
    $('.myrank .inviteNum').html(i.theChatsByUserId.inviteNum)
    $('.myrank .settleReward').html(i.theChatsByUserId.settleReward)
        // 排行榜
    let
        data = i.theChats,
        html = '',
        icon = ''
    if (data && data.length > 0) {
        data.forEach((e, i) => {
            switch (i) {
                case 0:
                    icon = `<img src="./image/invitation_icon_ranking_one.png" alt="" class='rankicon'></img>`
                    break;
                case 1:
                    icon = `<img src="./image/invitation_icon_ranking_two.png" alt="" class='rankicon'></img>`
                    break;
                case 2:
                    icon = `<img src="./image/invitation_icon_ranking_three.png" alt="" class='rankicon'></img>`
                    break;

                default:
                    icon = `<span class='rankscore'>` + (i + 1) + `</span>`
                    break;
            }
            let h = './image/invitation_icon_mine_head.png'
            if (e.headImg) { h = e.headImg }
            html += `
            <li class='flex_center'>
                <div class='flex_center' style='width: 45%'>` +
                icon +
                `<img src="` + h + `" alt="" class='headicon'>
                    <span class='rankusername'>` + e.nickName + `</span>
                </div>
                <div class='flex_center' style='width: 20%'> ` + e.inviteNum + `</div>
                <div class='getgold flex_center ' style='width: 35%'>
                    <span>` + e.settleReward + `</span>
                    <img src="./image/invitation_icon_gold_money.png" alt="" class='goldmoney'>
                </div>
            </li>
            `

        })
        $('.ranklist ul').append(html);
    }
}





$(document).ready(function() {
    //公告滚动
    var num = $(".notice ul").find("li").length;
    if (num > 1) {
        setInterval(function() {
            $('.notice ul').animate({
                marginTop: "-0.88rem"
            }, 500, function() {
                $(this).css({ marginTop: "0" }).find("li:first").appendTo(this);
            });
        }, 3000);
    }

    // 请求用户邀请信息
    $.ajax({
        type: "get",
        url: http + "/inviteReward/auth/getUserInfo",
        beforeSend: function(request) {
            request.setRequestHeader('userId', userInfo.userId);
            request.setRequestHeader('ticket', userInfo.ticket);
        },
        success: function(res) {
            if (res.success) {
                if (res.data) {
                    fullinUserInvite(res.data)
                } else [
                    alert('页面出错！')
                ]

            } else {}
        }
    });
    // 邀请排行榜信息
    $.ajax({
        type: "get",
        url: http + "/inviteReward/auth/theChats",
        beforeSend: function(request) {
            request.setRequestHeader('userId', userInfo.userId);
            request.setRequestHeader('ticket', userInfo.ticket);
        },
        success: function(res) {
            if (res.success) {
                if (res.data) {
                    fullinInviteRank(res.data)
                    let h = $(document).height() + 'px'
                    $('body').css('height', h)
                } else [
                    alert('页面出错！')
                ]

            } else {}
        }
    });

})

function routerRule() {
    console.log(location.host)
        // location.href = location.host + ''
    window.location.href =  "http://test.laifadan.com/activePage/activeRule/"

}

function routerToMyInviteInfo() {
    window.location.href = "http://test.laifadan.com/activePage/invite/inviteInfo/index.html?userId=" + userInfo.userId + "&ticket=" + userInfo.ticket
}

function routertostrate() {
    window.location.href =  "http://test.laifadan.com/activePage/invite/inviteStrategy/index.html"

}

function sharePoster() {
    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.sharePoster();
        } catch (e) {
            console.log('与android链接中断')

        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.sharePoster.postMessage({
                "name": "sharePoster"
            });
        } catch (e) {
            console.log('与ios链接中断')
        }
    }


}