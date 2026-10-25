(function () {
    'use strict';
    if (window.plugin_forced_subs) return;
    window.plugin_forced_subs = true;

    function enableForcedSubs(subs) {
        if (!subs || !subs.length) return false;

        // 1. Ищем русскую дорожку с меткой forced
        var target = null;
        for (var i = 0; i < subs.length; i++) {
            var s = subs[i];
            var lang = (s.language || '').toLowerCase();
            var label = (s.label || s.title || '').toLowerCase();

            if ((lang === 'rus' || lang === 'ru' || s.languageName === 'Russian') &&
                (label.indexOf('forced') !== -1 || label.indexOf('принуд') !== -1)) {
                target = s;
                break;
            }
        }
        if (!target) return false;

        // 2. Основной способ: внутренний метод Lampa (как при ручном выборе)
        if (window.Lampa && Lampa.PlayerVideo && typeof Lampa.PlayerVideo.loadSubs === 'function') {
            try {
                Lampa.PlayerVideo.loadSubs({ sub: target.trackNum });
                return true;
            } catch (e) { /* упадём в резерв */ }
        }

        // 3. Резерв: ручное переключение mode/selected + обновление панели
        for (var j = 0; j < subs.length; j++) {
            subs[j].mode = 'disabled';
            subs[j].selected = false;
        }
        target.mode = 'showing';
        target.selected = true;

        if (window.Lampa && Lampa.PlayerPanel && typeof Lampa.PlayerPanel.setSubs === 'function') {
            Lampa.PlayerPanel.setSubs(subs);
        }
        return true;
    }

    // Основной триггер: событие получения субтитров от webOS
    if (window.Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) {
        Lampa.PlayerVideo.listener.follow('webos_subs', function (data) {
            if (data && data.subs) {
                // Небольшая пауза, чтобы Lampa завершила свои внутренние апдейты
                setTimeout(function () {
                    enableForcedSubs(data.subs);
                }, 500);
            }
        });
    }

    // Резерв: если событие не пришло — проверяем напрямую (в течение 15 секунд)
    var checkInterval = setInterval(function () {
        var video = document.querySelector('video');
        if (video && video.webos_subs && video.webos_subs.length) {
            enableForcedSubs(video.webos_subs);
        }
    }, 1000);
    setTimeout(function () { clearInterval(checkInterval); }, 15000);
})();
