
/* -------------------------------------
    
    Pup Tent
    (c) 2012 @toddheasley
    
------------------------------------- */

(function($) {
    var request = function(screenName, count) {
        var url = "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&screen_name=" + screenName;
        if (count != null && count > 0) {
            url += "&count=" + count;
        }
        return url += "&callback=?";
    };
    var properties = {
        screenName: "",
        hashtag: "",
        mediaSize: ":large",
        profileURL: "https://twitter.com/",
        profileImageURL: "",
        items: {}
    };
    var methods = {
        profileURL: function(screenName) {
            if (screenName == null) {
                screenName = properties.screenName;
            }
            return properties.profileURL + screenName;
        },
        hasItems: function() {
            for (var item in properties.items) {
                return true;
            }
            return false;
        },
        init: function(callback) {
            var timer;
            var maxRequests = 3;
            var requests = 0;
            var setPath = function() {
                var pathComponents = window.location.pathname.split("/");
                if (pathComponents[1].length > 0) {
                    properties.screenName = pathComponents[1];
                    if (pathComponents.length > 2) {
                        properties.hashtag = pathComponents[2];
                        return true;
                    }
                }
                return false;
            }
            var requestData = function() {
                timer = setTimeout(handleTimeout, 3000);
                $.getJSON(request(properties.screenName, 150), function(data) {
                    clearTimeout(timer);
                    handleData(data);
                });
                requests++;
            };
            var handleData = function(data) {
                var filterItems = function(data) {
                    var filteredItems = [];
                    for (var item in data) {
                        for (hashtag in data[item].entities.hashtags) {
                            if (data[item].entities.hashtags[hashtag].text == properties.hashtag) {
                                filteredItems.push(data[item]);
                            }
                        }
                    }
                    return filteredItems;
                };
                var items = filterItems(data);
                if (items.length > 0) {
                    var name;
                    var element;
                    for (var item in items) {
                        if (properties.profileImageURL.length < 1) {
                            properties.profileImageURL = items[item].user.profile_image_url.replace("_normal", "_bigger");
                        }
                        name = "untitled";
                        element = {
                            mediaURL: "",
                            text: items[item].text.replace("#" + properties.hashtag, ""),
                            urls: [],
                            userMentions: []
                        }
                        for (var hashtag in items[item].entities.hashtags) {
                            if (items[item].entities.hashtags[hashtag].text != properties.hashtag) {
                                name = items[item].entities.hashtags[hashtag].text;
                                element.text = element.text.replace("#" + name, "");
                            }
                        }
                        if (typeof items[item].entities.media != "undefined") {
                            element.mediaURL = items[item].entities.media[0].media_url + properties.mediaSize;
                            element.text = element.text.replace(items[item].entities.media[0].url, "");
                        }
                        for (var url in items[item].entities.urls) {
                            element.urls.push(items[item].entities.urls[url].expanded_url);
                            element.text = element.text.replace(items[item].entities.urls[url].url, items[item].entities.urls[url].display_url);
                        }
                        for (var user_mention in items[item].entities.user_mentions) {
                            element.userMentions.push(items[item].entities.user_mentions[user_mention].screen_name);
                        }
                        element.text = $.trim(element.text);
                        if (properties.items[name] == null) {
                            properties.items[name] = [];
                        }
                        properties.items[name].push(element);
                    }
                }
                callback();
            };
            var handleTimeout = function() {
                if (requests < maxRequests) {
                    requestData();
                } else {
                    callback();
                }
            }
            if (! setPath()) {
                requests = maxRequests;
            }
            handleTimeout();
        }
    };
    
    $.fn.puptent = function(key, value) {
        if (methods[key]) {
            return methods[key](value);
        } else if (properties[key] != null) {
            if (value == null) {
                return properties[key];
            }
            properties[key] = value;
        } else {
            methods.init();
        }
    };    
})(jQuery);
