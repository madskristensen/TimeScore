var BadgeService = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {

            var points = localStorage["badge:" + badge];

            if (points) {
                var b = parseInt(points, 10)
                var thisBadge = allBadges[badge]
                thisBadge.level = Math.floor(points / 5);
                badges.push(thisBadge);
            }
        }

        return badges;
    }

    function addBadge(badge) {

        if (window.testmode || (badge.type === "single" && localStorage["badge:" + badge.id]))
            return;

        localStorage["badge:" + badge.id] = (localStorage["badge:" + badge.id] ? parseInt(localStorage["badge:" + badge.id], 10) : 1);
    }

    var allBadges = {
        newbie: {
            id: "newbie",
            name: "Newbie",
            description: "Congrats!! You got your first point",
            type: "single"
        },
        adventurer: {
            id: "adventurer",
            name: "Adventurer",
            description: "Congrats!! That's your first 10 points",
            type: "single"
        },
        timetraveller: {
            id: "timetraveller",
            name: "Time traveller",
            description: "You're a Time Traveller! That's 50 points",
            type: "single"
        },
        timebandit: {
            id: "timebandit",
            name: "Time Bandit",
            description: "Time Bandit got 100 points in one week",
            type: "single"
        },
        timelord: {
            id: "timelord",
            name: "Time Lord",
            description: "500 points in one week. You are a Time Lord!!",
            type: "single"
        },

        twentyfourseven: {
            id: "twentyfourseven",
            name: "We're open 24 hours a day",
            description: "Who do we appreciate"
        },
        beer: {
            id: "beer",
            name: "Beer o'clock",
            description: "Beer o'clock"
        },
        caitlin: {
            id: "caitlin",
            name: "Caitlin's birthday",
            description: "The inspiration was born at this time."
        },
        denmark: {
            id: "denmark",
            name: "Kingdom of Denmark",
            description: "Kingdom of Denmark was founded"
        },
        ellendun: {
            id: "ellendun",
            name: "Battle of Ellendun",
            description: "Battle of Ellendun which united England"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "It's a wonderful day for PI",
        },
        redsea: {
            id: "redsea",
            name: "What color is the sea?",
            description: "What sea hides under these coordinates?",
        },
        scooter: {
            id: "scotter",
            name: "Retro scooter",
            description: "Retro scooter",
        },
        seveneleven: {
            id: "seveneleven",
            name: "7-Eleven",
            description: "Thank heaven for this corner store",
        },
        shakespeare: {
            id: "shakespeare",
            name: "Shakespeare FTW!",
            description: "Shakespeare FTW!",
        },
        youknow: {
            id: "youknow",
            name: "You know if you know",
            description: "You know if you know"
        },
        martydeparts: {
            id: "martydeparts",
            name: "Marty McFly leaves for the future",
            description: "Marty McFly leaves for the future"
        },
        martyarrives: {
            id: "martyarrives",
            name: "Marty McFly arrives in the future",
            description: "Marty McFly arrives in the future"
        },
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});