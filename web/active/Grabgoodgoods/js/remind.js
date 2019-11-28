var http = "https://xiaolvlan.walongkeji.com",

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
var Listreminder = {
    relationId: 3,
    page: 0,
    pageSize: 10
}

//取消的请求参数
var dellist = {
    id: 2
}
//测试数据
// var data = {
//     "img": "http://img.juimg.com/tuku/yulantu/140218/330598-14021R23A410.jpg",//商品图片
//     "plateId": 3,//版块id
//     "minGroupPrice": "2",//折扣价
//     "minNormalPrice": "100000",//原价
//     "startTime": 1563969568000,//开始时间
//     "id": 2,//推送id
//     "plateGoodsId": 3,//版块商品库关联id
//     "pushTime": 1563969538000,//推送时间
//     "goodsName": "365商品测试"//商品名 
// }

var remindList = []; //商品推送列表
// remindList[0] = data;
// fullinlist(remindList)
function remindlistDate() {
    // console.log(data);
    //商品推送列表请求
    $.ajax({
        url: http + `/reservationRemind/auth/getPlateGoodsList?relationId=` + Listreminder.relationId + `&page=` + Listreminder.page + `&pageSize=` + Listreminder.pageSize,
        type: "get",
        beforeSend: function (request) {
            request.setRequestHeader("userId", userInfo.userId);
            request.setRequestHeader("ticket", userInfo.ticket);
        },
        success: function (res) {
            if (res.success) {
                if (res.data.length > 0) {
                    remindList = res.data
                    fullinlist(res.data);
                } else {
                    //alert("没有商品");
                    // $('.centent').html(''); //清空列表的推送商品
                }
            }
        }
    });
}
remindlistDate();
//商品推送列表
function fullinlist(showRemind) {
    $('.centent').html(); //清空列表的推送商品 
    var html = '';
    showRemind.forEach((r) => {
        html += `<div data-id=` + r.id + ` class='robbed-r'>
            <div class='goodurl'>
            <img src="` + r.img + `" alt=""/>
            <p>`+ new Date(r.startTime).getDay() + "日" + getRemindHour(r.startTime) + `开抢</p >
            </div>
            <div class="rbcw">
                <p>` + r.goodsName + `</p>
                <div class="Alreadyrobbed-r">
                    <span class="money-r">￥` + (parseInt(r.minGroupPrice) / 100) + `</span>
                    <span class="price-r">￥` + (parseInt(r.minNormalPrice) / 100) + `</span>
                </div>
            <div class="tx">
            <p>` + getRemindHour(r.pushTime) + `提醒</p >
                <button type="button" class="btn" id="qbtn" onclick="cancelreminde(`+ r.id + `)">取消提醒</button>
            </div>
            </div>
                </div>`
    });
    $('.centent').html(html); //列表推送添加至商品列表div 
}

// 获取时分
function getRemindHour(i) {
    let day = new Date(i).getDay(),
        hours = new Date(i).getHours(),
        minute = new Date(i).getMinutes();
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    return hours + ":" + minute
}

//取消提醒请求
function cancelreminde(goodsid) {
    $.ajax({
        url: http + "/reservationRemind/auth/del",
        type: "post",
        data: {
            id: goodsid
        },
        beforeSend: function (request) {
            request.setRequestHeader("userId", userInfo.userId);
            request.setRequestHeader("ticket", userInfo.ticket);
        },
        success: function (res) {
            if (res.code == 0) {
                alert('取消成功')
                // 刷新当前数据
                remindlistDate();
            } else {
                alert(res.message)
            }
        }
    });
}
