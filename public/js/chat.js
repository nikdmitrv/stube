let masterStatus = false;
let tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;

function getVideoId() {
    let input = document.getElementById('insert_video_input').value
    let videoId = input.split('v=')[1];
    let ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition != -1) {
        videoId = videoId.substring(0, ampersandPosition);
    }
    return videoId;

}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'K3Qzzggn--s',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

let done = false;

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}
function stopVideo() {
    player.pauseVideo();
}

function init() {
    fetch('/logged')
        .then((data) => {
            return data.json();
        })
        .then((parsedData) => {
            return parsedData.data
        })
        .then((data) => {
            if (data.isLogged) {
                const nickname = data.username;
                document.getElementById('nickname').innerText = nickname;
                const wsc = new WebSocket('wss://localhost:3000/');



                wsc.onopen = () => {
                    document.send_message.elements['send'].disabled = false;
                    document.send_message.elements['send'].addEventListener('click', (e) => {
                        e.preventDefault();
                        const messageInput = document.send_message.elements['message'];
                        wsc.send(JSON.stringify({
                            newMessage: {
                                nickname,
                                message: messageInput.value,
                            }
                        }));
                        messageInput.value = '';
                    });
                    document.getElementById('insert_video_button').addEventListener('click', () => {
                        const data = JSON.stringify({
                            videoChange: {
                                id: getVideoId(document.getElementById('insert_video_input').value)
                            },
                        })
                        wsc.send(data);
                        document.getElementById('insert_video_input').value = '';
                    });

                    document.getElementById('master-status-button').addEventListener('click', () => {
                        if (!masterStatus) {
                            const data = JSON.stringify({
                                masterWho: nickname,
                            })
                            wsc.send(data);
                            document.getElementById('master-status').innerText = `${nickname} is master!`
                        }
                    });

                    player.addEventListener('onStateChange', e => {
                        if (masterStatus) {
                            const data = JSON.stringify({
                                videoState: e.data,
                                videoTime: player.getCurrentTime(),
                            })
                            wsc.send(data);
                        }
                    });

                };

                wsc.onmessage = event => {
                    const data = JSON.parse(event.data);
                    if (data.masterWho) {
                        data.masterWho === nickname
                            ? masterStatus = true
                            : masterStatus = false;
                    }

                    if (data.newMessage) {
                        const nickname = document.createElement('span');
                        nickname.innerText = data.newMessage.nickname + ': ';
                        const message = document.createElement('span');
                        message.innerText = data.newMessage.message;
                        const entry = document.createElement('p');
                        entry.appendChild(nickname);
                        entry.appendChild(message);
                        const chat = document.getElementById('chat');
                        chat.appendChild(entry)
                    }
                    if (data.videoChange) {
                        player.loadVideoById(data.videoChange.id)
                    }
                    if (data.masterWho) {
                        document.getElementById('master-status').innerText = `${data.masterWho} is master!`;
                    }
                    if (data.videoState && !masterStatus) {
                        let state = data.videoState;
                        switch (state) {
                            case 1:
                                player.seekTo(data.videoTime);
                                player.playVideo();
                                break;
                            case 2:
                                player.pauseVideo();
                                break;
                            case 3:
                                player.pauseVideo();
                                break;
                        }
                    }
                };
            }
        })


}

function onPlayerReady(event) {
    event.target.playVideo();
    event.target.pauseVideo();
    init();
}