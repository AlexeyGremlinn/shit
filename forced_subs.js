(function () {
    'use strict';

    if (window.plugin_forced_subs_ready) return;

    function startPlugin() {
        window.plugin_forced_subs_ready = true;

        function add() {
            Lampa.Listener.follow('player', function (e) {
                if (e.type !== 'start') return;

                // Ждем, пока плеер загрузит дорожки
                setTimeout(function () {
                    try {
                        var video = document.querySelector('video');
                        if (!video) return;

                        // На webOS Lampa хранит дорожки в webos_tracks
                        var tracks = video.webos_tracks || video.textTracks;
                        if (!tracks || !tracks.length) return;

                        var targetIndex = -1;

                        for (var i = 0; i < tracks.length; i++) {
                            var t = tracks[i];
                            var lang = (t.language || t.lang || '').toLowerCase();
                            var label = (t.label || t.name || t.title || '').toLowerCase();

                            var isRussian = (lang.indexOf('ru') === 0 || label.indexOf('rus') !== -1);
                            var isForced = (label.indexOf('forced') !== -1 || label.indexOf('принуд') !== -1);

                            if (isRussian && isForced) {
                                targetIndex = i;
                                break;
                            }
                        }

                        if (targetIndex !== -1) {
                            for (var j = 0; j < tracks.length; j++) {
                                tracks[j].mode = 'disabled';
                                tracks[j].selected = false;
                            }
                            tracks[targetIndex].mode = 'showing';
                            tracks[targetIndex].selected = true;
                        }
                    } catch (err) {
                        // Игнорируем ошибки внутри, чтобы не сломать плеер
                    }
                }, 1500);
            });
        }

        if (window.appready) {
            add();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    add();
                }
            });
        }
    }

    if (!window.plugin_forced_subs_ready) {
        startPlugin();
    }
})();