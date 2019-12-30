window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', (e) => {
        // hide our user interface that shows our A2HS button
        addBtn.style.display = 'none';
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

(function () {
    $(document).ready(function () {
        fetchNextPosts();
    })

    document.addEventListener('scroll', function (event) {
        var scrollHeight = $(document).height();
        var scrollPosition = $(window).height() + $(window).scrollTop();
        if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
            fetchNextPosts();
        }
    }, true);

    document.querySelector('.page__content').addEventListener('scroll', function (event) {
        var scrollTopPosition = event.target.scrollTop,
            scrollHeight = event.target.scrollHeight,
            clientHeight = event.target.clientHeight,
            paginateTopPosition = scrollHeight - clientHeight - 500;

        if (scrollTopPosition > paginateTopPosition) {
            window.setTimeout(
                function () {
                    fetchNextPosts();
                },
                500
            )
        }

    });

    var lastTimestamp = 0;
    var receivedTimestamps = {};
    var requestedTimestamps = {};

    function fetchNextPosts() {

        if (requestedTimestamps[lastTimestamp]) {
            return;
        }

        var requestedLastTimeStamp = lastTimestamp;
        requestedTimestamps[requestedLastTimeStamp] = requestedLastTimeStamp;

        $.get({
            url: '/app02/posts/chihuahua/' + lastTimestamp,
            success: function (response) {
                var receivedLastTimestamp = response[response.length - 1].timestamp;
                console.log(response);

                if (!receivedTimestamps[requestedLastTimeStamp]) {
                    renderPosts(response);
                    receivedTimestamps[requestedLastTimeStamp] = requestedLastTimeStamp;
                    lastTimestamp = receivedLastTimestamp;
                }

            },
            dataType: 'json'
        });
    }

    function renderPosts(apiResponse) {
        var itemsHtml = '',
            plyrIds = [],
            postCounter = 0;

        for (let i = 0; i < apiResponse.length; ++i) {
            itemsHtml = renderPost(apiResponse[i], plyrIds);

            $('#post_list').append(itemsHtml);

            if (plyrIds.length > 0) {
                for (let i = 0; i < plyrIds.length; ++i) {
                    initVideoJs(plyrIds[i]);
                }
            }

            postCounter++;

            if (postCounter % 7 == 0) {
                $('#post_list').append(
                    '<ons-list-item>' +
                    '    <ons-card>' +
                    '<ins class="adsbygoogle"' +
                    '  style="display:block; text-align:center;"' +
                    '  data-ad-layout="in-article"' +
                    '  data-ad-format="fluid"' +
                    '  data-ad-client="ca-pub-9450457991119200"' +
                    '  data-ad-slot="9433251636">' +
                    '</ins>' +
                    '    </ons-card>' +
                    '</ons-list-item>'
                );
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        }
    }

    function initVideoJs(plyrId) {
        player = new Plyr('#' + plyrId);

        player.on('ready', event => {
            playButtons = event.detail.plyr.elements.buttons.play;
            for (let i = 0; i < playButtons.length; ++i) {
                $element = $(playButtons[i]);
                if ($element.hasClass('plyr__control--overlaid')) {
                    $svg = $element.find('svg[role=presentation]');
                    $svg.attr('viewBox', '0 0 30 30');
                }
            }
        });
    }

    var plyrIdCounter = 1;

    function renderPost(post, plyrIds) {
        var i = 0,
            date = (new Date(post.timestamp * 1000)).toLocaleString(),
            textContent = '',
            imageHtml = '';

        if (post.photos) {
            for (var i = 0; i < post.photos.length; ++i) {
                imageHtml += '<img src="' + post.photos[i].url + '"/><br/>';
            }
        }

        if (post.caption) {
            textContent = post.caption;
        } else if (post.text) {
            textContent = post.text
        }

        if (post.videos) {

            // determine id
            match = post.videos.embedCode.match(/<video.*id=["'](\S+)["']/);
            if (match && match.length > 0) {
                videoContainerId = match[1];
            }
            if (!videoContainerId) {
                videoContainerId = 'plyr-id-' + plyrIdCounter++;
                post.videos.embedCode = post.videos.embedCode.replace('<video', '<video id="' + videoContainerId + '"');
            }

            post.videos.embedCode = post.videos.embedCode.replace('<video', '<video id="' + videoContainerId + '"');

            plyrIds.push(videoContainerId);

            textContent += post.videos.embedCode;
        }

        if (imageHtml) {
            textContent += imageHtml;
        }

        return '<ons-list-item>' +
            '    <ons-card>' +
            '       <div class="post-container">' +
            '        <div class="title">From ' + post.blogger + ' at ' + date + '</div>' +
            '        <div class="card__content">' + textContent + '</div>' +
            '       </div>' +
            '    </ons-card>' +
            '</ons-list-item>';
    }
}());

