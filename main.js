var Names, numSSR, numLimited = 0,
    isSelected, filter = { cu: true, co: true, pa: true, lim: true, nolim: true },
    table = "0123456789abcdefghijklmnopqrstuvwxyz-_ABCDEFGHIJKLMNOPQRSTUVWXYZ";



function getUrlVars() {
    var vars = [], max = 0, hash = "", array = "";
    var url = window.location.search;

    hash = url.slice(1).split('&');
    max = hash.length;
    for (var i = 0; i < max; i++) {
        array = hash[i].split('=');
        vars.push(array[0]);
        vars[array[0]] = array[1];
    }

    return vars;
}

function makeResultString(normal, limited) {
    var sum = normal + limited;
    var str = 'デレステSSR所有率は' + (100 * sum / numSSR).toFixed() + '% [' + sum + '/' + numSSR + ']です。\n ';
    str += '(内訳：恒常' + (100 * normal / (numSSR - numLimited)).toFixed() + '% [' + normal + '/' + (numSSR - numLimited) + '], 限定' + (100 * limited / numLimited).toFixed() + '% [' + limited + '/' + numLimited + '])'
    return str;
}

function calc() {
    var normal = 0, limited = 0;
    for (var i = 0; i < Names.length; i++)
        if (isSelected[i]) {
            if (Names[i]["limited"]) limited += 1;
            else normal += 1;
        }

    document.getElementById("percentage").innerText = makeResultString(normal, limited);
    return [normal, limited];
}

function tweet() {
    var str = "";
	for (var i = 0; i < Math.ceil(numSSR / 6); i++) {
		var ch = 0;
		for (var j = 0; j < 6; j++) {
			if (isSelected[6 * i + j]){
				ch += 1 << (5 - j);
			}
		}
		str += table[ch];
	}

    var res = calc();
    var sum = res[0] + res[1];
    var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(makeResultString(res[0], res[1]));
    url += '&url=http%3A%2F%2Fpiniky-lab.net%2Fcgss%2Fchara%2Findex.html?ssr2=' + str;
    url += '&hashtags=%E3%83%87%E3%83%AC%E3%82%B9%E3%83%86%E6%89%80%E6%9C%89%E7%8E%87';
    window.open(url);
}

$.getJSON('name.min.json', function (data) {
    Names = data;
    numSSR = Names.length;
    isSelected = new Array(Names.length);
});
$(window).load(function () {
    for (var i = 0; i < Names.length; i++)
        if (Names[i]["limited"])
            numLimited += 1;

    var query = getUrlVars()["ssr2"];
    if (query != undefined) {
        //SSR2の処理
        for (var i = 0; i < query.length; i++) {
            var ch = table.indexOf(query[i]);
            if (ch == -1) break;

            for (var j = 0; j < 6; j++) {
                if (6 * i + j < numSSR){
                    isSelected[6 * i + j] = (ch & (1 << (5 - j)) ? true : false);
                }
            }            
        }
    } else {
        //旧クエリの処理
        query = getUrlVars()["ssr"];
        if (query == undefined) query = '';
        var q1 = parseInt(query.substr(0, 10), 36);
        var q2 = parseInt(query.substr(10, 10), 36);
        q1 = q1.toString(2);
        q1 = ('00000000000000000000000000000000000000000000000000' + q1).slice(-50);
        q2 = q2.toString(2);
        q2 = ('00000000000000000000000000000000000000000000000000' + q2).slice(-50);

        for (var i = 0; i < q1.length; i++) {
            if (q1[i] == "1") isSelected[i] = true;
        }
        for (var i = 0; i < q2.length; i++) {
            if (q2[i] == "1") isSelected[i + 50] = true;
        }
    }

    calc();
    var elem = document.getElementById('buttons');
    var str = '';
    for (var i = 0; i < Names.length; i++) {
        str += '<button type="button" id="' + i + '" class="btn btn-default btnSSR visible ';
    if (isSelected[i]) str += "selected";    
        str += '" title="' + Names[i]["name"] + '" style="width:100px"><img style="display: none;" class="img_normal" src="img/normal/' + i + '.png" width="80" /><img class="img_awaken" src="img/awaken/' + i + '.png" width="80" /><br /><div class="charaname">' + Names[i]["name"] + '</div></button>';
    }

    elem.innerHTML = str;
    for (var i = 0; i < Names.length; i++) {
        if (Names[i]["limited"]) $("#" + i).addClass("lim");
        else $("#" + i).addClass("nolim");

        if (Names[i]["attr"] == 0) $("#" + i).addClass("cu");
        else if (Names[i]["attr"] == 1) $("#" + i).addClass("co");
        else $("#" + i).addClass("pa");
    }
    $(".btnSSR").click(function () {
		isSelected[this.id] = !isSelected[this.id];
		$(this).toggleClass("selected");
        calc();
    });
    $(".selectall").click(function () {
        for (var i = 0; i < Names.length; i++) {
            $("#" + i).addClass("selected");
            isSelected[i] = true;
        }
        calc();
    });
    $(".selectnone").click(function () {
        for (var i = 0; i < Names.length; i++) {
            $("#" + i).removeClass("selected");
            isSelected[i] = false;
        }
        calc();
    });
    $(".tweet").click(function () {
        tweet();
    });
    $(".btn-filter").click(function () {
        if ($(this).hasClass('active'))
            filter[$(this).attr("id")] = false;
        else
            filter[$(this).attr("id")] = true;


        for (var i = 0; i < Names.length; i++) {
            var attr = (Names[i]["attr"] == 0 ? "cu" : (Names[i]["attr"] == 1 ? "co" : "pa"));
            if ((!filter[(Names[i]["limited"] ? "lim" : "nolim")] || !filter[attr]) && $("#" + i).hasClass("visible")) {
                $("#" + i).hide();
                $("#" + i).removeClass("visible");
                $("#" + i).addClass("invisible");
            }
            else if (filter[(Names[i]["limited"] ? "lim" : "nolim")] && filter[attr] && $("#" + i).hasClass("invisible")) {
                $("#" + i).show();
                $("#" + i).removeClass("invisible");
                $("#" + i).addClass("visible");
            }
        }

    });
    $(".togglenamedisp").click(function () {
        $(".charaname").slideToggle("slow");
    });
	$(".toggleawaken").click(function () {
        $(".img_normal, .img_awaken").toggle();
    });
});