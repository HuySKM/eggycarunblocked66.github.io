$(document).ready(function () {
    $(".site-sort").on('click', function () {
        $(".site-sort").removeClass("active");
        $(this).addClass("active");
        let data_sort = $(this).data('sort');
        field_order = data_sort;
        paging(1);
    });
    $(".icon-search").on('click', function (e) {
        $(".fixed-menu-mobile").css({'transform': "translateX(0)"});
        $(".opacity-box").show();
    });

    $(".opacity-box").on('click', function (e) {
        $(".fixed-menu-mobile").css({'transform': "translateX(100%)"});
        $(".opacity-box").hide();
    });
    $(".nav-close").on("click", function () {
        $(".opacity-box").click();
    })
    $("#expand").on('click', function () {
        $("#iframehtml5").addClass("force_full_screen");
        $("#_exit_full_screen").removeClass('hidden');
        requestFullScreen(document.body);
    });
    $("#_exit_full_screen").on('click', cancelFullScreen);

    $(window).on('popstate', function () {
        let arr_path = ["about-us", "contact-us", "copyright-infringement-notice-procedure", "error-404", "privacy-policy", "term-of-use"];
        let arr_menuheader = ["all-games", "new-games", "hot-games"];
        let path_name = location.pathname;
        let params = location.search;
        let searchParams = null;
        let object_data = {};
        if (params) {
            searchParams = new URLSearchParams(location.search);
            object_data.page = searchParams.has('page') ? searchParams.get('page') : null;
            object_data.keywords = searchParams.has('q') ? searchParams.get('q') : null;
        }
        let type = "";
        let kw;
        let slug = path_name.split("/")[path_name.split("/").length - 1];
        if (path_name.indexOf("/games/") >= 0) {
            type = 'category';
        } else if (path_name.indexOf("/tag/") >= 0) {
            type = 'tag';
        } else if (path_name.indexOf("/search") >= 0) {
            type = 'search';
            if (searchParams && searchParams.has('q')) {
                kw = searchParams.get('q');
            }
        } else if (arr_path.indexOf(slug) >= 0) {
            type = "footermenu";
        } else if (arr_menuheader.indexOf(slug) >= 0) {
            type = "menuheader";
        } else {
            if (path_name == "/") {
                type = "";
                slug = slug_home;
            }
        }
        if (type) {
            callLink(slug, type, object_data, false);
        } else {
            callGame(slug, false);
        }
    });

    $('input[name="q"]').on('keyup', async function (e) {
        let value = $(this).val();
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (value.length) {
                let obj = {};
                obj.keywords = value;
                await callLink("search", "search", obj);
                $(".fixed-menu-mobile").css({'transform': "translateX(100%)"});
                $(".opacity-box").hide();
            }
        }
        return;
    })
    add_plugin();
});

function add_plugin() {
    let url = "/add-plugin.ajax";
    if (typeof id_game != 'undefined' && typeof url_game != 'undefined') {
        $.ajax({
            type: "POST",
            url: url,
            data: {id: id_game, url: url_game},
            success: function (data) {
                if (data) {
                    let html = JSON.parse(data);
                    if (html.html_rate) {
                        $("#append-rate").html(html.html_rate);
                    }
                    if (html.html_comment) {
                        $("#append-comment").html(html.html_comment);
                    }
                }
            }
        });
    }
}

function paging(p) {
    $(".gif").removeClass("hidden");
    let url = '/paging.ajax';
    let current_url = location.origin + location.pathname;
    $.ajax({
        type: "POST",
        url: url,
        data: {
            page: p,
            keywords: keywords,
            tags_id: tag_id,
            category_id: category_id,
            field_order: field_order,
            order_type: order_type,
            is_hot: is_hot,
            is_new: is_new,
            limit: limit
        },
        success: function (xxxx) {
            $("html, body").animate({scrollTop: 0}, 300);
            if (xxxx !== '') {
                let data = JSON.parse(xxxx);
                $("#ajax-append").html(data.content);
                let new_url = current_url + data.url;
                history.pushState(null, '', new_url);
                $(".gif").addClass("hidden");
            }
        }
    });
}
function scrollToDiv(element) {
    if ($(element).length) {
        $('html,body').animate({scrollTop: $(element).offset().top - 100}, 'slow');
    }
}
function closeBox() {
    $(".close-sharing-box").hide();
    $(".clipboard-share").addClass("hide-zindex");
}

function showSharingBox() {
    $(".close-sharing-box").show();
    $(".clipboard-share").removeClass("hide-zindex");
}


function expand() {
    $("#expand").on('click', function () {
        $("#_exit_full_screen").removeClass('hidden');
        $("#iframehtml5").addClass("force_full_screen");
        requestFullScreen(document.body);
    });
    $("#_exit_full_screen").on('click', cancelFullScreen);
    $(".site-sort").on('click', function () {
        $(".site-sort").removeClass("active");
        $(this).addClass("active");
        let data_sort = $(this).data('sort');
        field_order = data_sort;
        paging(1);
    });
}

function clickGame(event, game_slug) {
    event.preventDefault();
    try {
        callGame(game_slug);
        return true;
    } catch (e) {
        return true;
    }
}

function callGame(game_slug, flag = true) {
    $(".layer-loading").removeClass('hidden');
    $.ajax({
        url: '/load_game.ajax',
        type: "POST",
        data: {slug: game_slug},
        success: async function (data, textStatus, jqXHR) {
            $(".layer-loading").addClass('hidden');
            $("html, body").animate({scrollTop: 0}, 300);
            if (data) {
                let data_html = JSON.parse(data);
                await $("#game-page").html(data_html.content);
                changeMetaTag(data_html.metadata, flag)
                expand();
                add_plugin();
                if (window.__sharethis__) {
                    window.__sharethis__.initialize()
                }
            }
        }
    })
}
function clickLink(event, slug, type, flag = true) {
    event.preventDefault();
    try {
        callLink(slug, type);
        return true;
    } catch (e) {
        return true;
}


}
function callLink(slug, type, obj = null, flag = true) {
    $(".layer-loading").removeClass('hidden');
    let url = '/load_game_home.ajax';
    if (type == 'footermenu') {
        url = '/load_footer_ajax.ajax';
    }
    $.ajax({
        url: url,
        type: "POST",
        data: {slug: slug, type: type, object_data: obj},
        success: function (data, textStatus, jqXHR) {
            $(".layer-loading").addClass('hidden');
            if (data) {
                let data_html = JSON.parse(data);
                $("#game-page").html(data_html.content);
                changeMetaTag(data_html.metadata, flag);
                if (slug == "contact-us") {
                    runValidate();
                }
                expand();
            }
        }
    })
}
function changeMetaTag(meta_object, flag = true) {
    if (typeof meta_object != 'object')
        return;
    $('title').html(meta_object.site_title);
    $('meta[name="title"]').attr("content", meta_object.site_title);
    $('meta[name="description"]').attr("content", meta_object.site_description);
    $('meta[name="keywords"]').attr("content", meta_object.site_keywords);
    $('meta[name="news_keywords"]').attr("content", meta_object.site_keywords);
    $('link[rel="canonical"]').attr("href", meta_object.base_url);
    $('link[rel="icon"]').attr("href", meta_object.favicon);
    $('link[rel="apple-touch-icon"]').attr("href", meta_object.favicon);
    $('link[sizes="57x57"]').attr("href", meta_object.favicon57);
    $('link[sizes="72x72"]').attr("href", meta_object.favicon72);
    $('link[sizes="114x114"]').attr("href", meta_object.favicon114);
    $('meta[property="og:title"]').attr("content", meta_object.site_title);
    $('meta[property="og:url"]').attr("content", meta_object.base_url);
    $('meta[property="og:description"]').attr("content", meta_object.site_description);
    $('meta[property="og:site_name"]').attr("content", meta_object.site_title);
    $('meta[name="twitter:title"]').attr("content", meta_object.site_title);
    $('meta[name="twitter:url"]').attr("content", meta_object.base_url);
    $('meta[name="twitter:description"]').attr("content", meta_object.site_description);
    if (flag)
        history.pushState(null, '', meta_object.base_url);
}
function runValidate() {
    jQuery("#contact-form").validate({
        focusInvalid: false,
        onfocusout: false,
        ignore: ".ignore",
        rules: {
            Name: {
                required: true,
                maxlength: 255,
            },
            Email: {
                required: true,
                email: true,
                maxlength: 100
            },
            Website: {
                required: false,
                maxlength: 255,
            },
            Topic: {
                required: false,
                maxlength: 255,
            },
            Message: {
                required: true,
                maxlength: 65525
            },
            "hiddenRecaptcha": {
                required: function () {
                    if (grecaptcha.getResponse() == '') {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        },
        messages: {
            Name: {
                required: "Please type your name!",
                maxlength: "255"
            },
            Email: {
                required: "Please type your email!",
                email: "Please check a valid email!",
                maxlength: "100"
            },
            Message: {
                required: "Please type your message!",
                maxlength: "65525"
            },
            "hiddenRecaptcha": {
                required: "Please verify you are human!",
            }
        },
        submitHandler: function () {
            let question_ajax = "/make-contact.ajax";
            let name = jQuery("#Name").val();
            let email = jQuery("#Email").val();
            let website = jQuery("#Website").val();
            let subject = jQuery("#Topic").val();
            let message = jQuery("#Message").val();
            let metadataload = {};
            metadataload.name = name;
            metadataload.email = email;
            metadataload.website = website;
            metadataload.subject = subject;
            metadataload.message = message;
            jQuery.ajax({
                url: question_ajax,
                data: metadataload,
                type: 'POST',
                success: function (data) {
                    if (data != 0 || data != '0') {
                        showSuccessMessage();
                    }
                }
            });
        }
    });
}
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).attr('href')).select();
    document.execCommand("copy");
    $temp.remove();
}
function requestFullScreen(element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function cancelFullScreen() {
    $("#_exit_full_screen").addClass('hidden');
    $("#iframehtml5").removeClass("force_full_screen");
    var requestMethod = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.exitFullScreenBtn;
    if (requestMethod) { // cancel full screen.
        requestMethod.call(document);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

if (document.addEventListener) {
    document.addEventListener('webkitfullscreenchange', exitHandler, false);
    document.addEventListener('mozfullscreenchange', exitHandler, false);
    document.addEventListener('fullscreenchange', exitHandler, false);
    document.addEventListener('MSFullscreenChange', exitHandler, false);
}

function exitHandler() {
    if (document.webkitIsFullScreen === false
            || document.mozFullScreen === false
            || document.msFullscreenElement === false) {
        cancelFullScreen();
    }
}
