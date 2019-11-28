var pageList = [{
            type: 1, // 娱乐券
            title: {
                bgurl: "./image/vip_coupons_image_movies_top.png", //头部背景
                url: "./image/vip_coupons_title_movies.png", // 标题链接
                text: '领券会员追剧更过瘾 搞笑综艺大片看不停' // 标题文字
            },

        },
        {
            type: 2, // 外卖券
            title: {
                bgurl: "./image/vip_coupons_image_take_out_top.png", //头部背景
                url: "./image/vip_coupons_title_take_out.png", // 标题链接
                text: '今天外卖订餐先领券 美食随叫随到不纠结' // 标题文字
            },
        },
        {
            type: 3, // 出行券
            title: {
                bgurl: "./image/vip_coupons_image_travel_top.png", //头部背景
                url: "./image/travel.png", // 标题链接
                text: '出游出行首先要领券 单单立省金额看的见' // 标题文字
            },
        }
    ],
    http = 'https://xiaolvlan.walongkeji.com',
    type = null,
    headerImgArr = [], // 头部logo数组
    contentList = []; // 正文数据;

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return "";
}

function fullInPageData(data) {
    // 渲染ul列表
    if (data.length == 0) return false
    var checkblock_html = '';
    $('.checkblock ul').html('')
    data.forEach((e, i) => {
        checkblock_html += `
            <li data-id=` + e.id + ` onclick='checkblock(` + e.id + `)'>
                <span class="` + (i == 0 ? 'active' : '') + `">` + e.coupName + `</span>
                <div class=" ` + (i == 0 ? '' : 'underline') + `"></div>
            </li>
            `

        if (i == 0) {
            renderContentList(e.id)
        }
    })
    $('.checkblock ul').html(checkblock_html).append('<section></section>')
}
// 渲染正文列表 
function renderContentList(id) {
    // 根据ID筛选数据，没有id则默认渲染第一条
    var coupons_html = '';
    for (let index = 0; index < contentList.length; index++) {
        const e = contentList[index];
        if (id == e.id) {
            let src = e.coupPic
            e.list.forEach((_e, _i) => {
                coupons_html += `
                <li>
                <div>
                    <img src="` + src + `" alt="">
                    <div>
                        <p>` + _e.coupTitle + `</p>
                        <p>有效期剩余25天</p>
                    </div>
                </div>
                <div>
                    <a href='` + _e.url + `'>
                        <p>立即</p>
                        <p>领取</p>
                    </a>
                </div>

            </li>
                     
                `
            })
            $('.coupons ul').html(coupons_html)
            break
        }
    }
}
// 列表切换
function checkblock(i) {
    $('.checkblock ul li span').removeClass('active').siblings('div').addClass('underline')
    $('.checkblock ul li').each(function() {
        if ($(this).attr('data-id') == i) {
            $(this).find('span').addClass('active').siblings('div').removeClass('underline')
        }
    })
    renderContentList(i)
}
// 头部渲染
function fullInHeaderData() {
    pageList.forEach(e => {
        if (e.type == type) {
            $('.header > img').attr('src', e.title.url).siblings('p').text(e.title.text).parent().css('backgroundImage', "url(" + e.title.bgurl + ")")
        }
    });
    var headerul_html = '';
    headerImgArr.forEach(e => {
        headerul_html += `
        <li>
        <img src="` + e + `" alt="">
    </li>
        `
    });
    $('.header > ul').html(headerul_html)
}

$(document).ready(function() {
    type = Number(GetQueryString('type'))
    let _title = ''
    switch (type) {
        case 1:
            _title = '娱乐券'

            break;
        case 2:
            _title = '外卖券'
            break;
        case 3:
            _title = '出行券'
            break;
        default:
            _title = '领券中心'
            break;
    }
    $("title").html(_title);

    $.ajax({
        type: "get",
        url: http + "/looquan/getCouponList?type=" + type,
        success: function(res) {
            if (res.success) {
                contentList = res.data
                res.data.forEach((e) => {
                    headerImgArr.push(e.coupLogoPic)
                })
                fullInHeaderData()
                fullInPageData(res.data)
            } else {}
        }
    });
})