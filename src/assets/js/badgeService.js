var BadgeService = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {

            var points = localStorage["badge:" + badge];

            if (points) {
                var numericPoints = parseInt(points, 10);
                var thisBadge = allBadges[badge];
                thisBadge.level = Math.floor(numericPoints / 5);
                badges.push(thisBadge);
            }
        }

        return badges;
    }

    function addBadge(badge) {

        if (window.testmode || (badge.type === "single" && localStorage["badge:" + badge.id]))
            return;

        var key = "badge:" + badge.id;
        var existingCount = parseInt(localStorage[key], 10) || 0;
        localStorage[key] = String(existingCount + 1);
    }

    var allBadges = {
        newbie: {
            id: "newbie",
            name: "Newbie",
            description: "Congrats!! You got your first point",
            type: "single",
            rarity: "common"
        },
        adventurer: {
            id: "adventurer",
            name: "Adventurer",
            description: "Congrats!! That's your first 10 points",
            type: "single",
            rarity: "common"
        },
        timetraveller: {
            id: "timetraveller",
            name: "Time traveller",
            description: "You're a Time Traveller! That's 50 points",
            type: "single",
            rarity: "rare"
        },
        timebandit: {
            id: "timebandit",
            name: "Time Bandit",
            description: "Time Bandit got 100 points in one week",
            type: "single",
            rarity: "rare"
        },
        timelord: {
            id: "timelord",
            name: "Time Lord",
            description: "500 points in one week. You are a Time Lord!!",
            type: "single",
            rarity: "legendary"
        },
        timegamer: {
            id: "timegamer",
            name: "Time gamer",
            description: "1000 points in one week. You are a Time Gamer!!",
            type: "single",
            rarity: "legendary"
        },

        twentyfourseven: {
            id: "twentyfourseven",
            name: "We're open 24 hours a day",
            description: "Who do we appreciate",
            rarity: "rare"
        },
        midnight: {
            id: "midnight",
            name: "Midnight",
            description: "A fresh day starts now",
            rarity: "legendary"
        },
        noon: {
            id: "noon",
            name: "Noon",
            description: "Midday on the dot",
            rarity: "common"
        },
        counting: {
            id: "counting",
            name: "Counting Sequence",
            description: "1:23 and rolling",
            rarity: "rare"
        },
        beer: {
            id: "beer",
            name: "Beer o'clock",
            description: "Beer o'clock",
            rarity: "common"
        },
        fourtwenty: {
            id: "fourtwenty",
            name: "420",
            description: "A very recognizable time",
            rarity: "common"
        },
        lucky: {
            id: "lucky",
            name: "Lucky Time",
            description: "08:08 brings lucky vibes",
            rarity: "rare"
        },
        keynote: {
            id: "keynote",
            name: "Keynote Time",
            description: "A familiar product demo timestamp",
            rarity: "rare"
        },
        watchface: {
            id: "watchface",
            name: "Watch Face Time",
            description: "The classic display time",
            rarity: "common"
        },
        makeawish: {
            id: "makeawish",
            name: "Make-a-Wish",
            description: "Catch the wish time",
            rarity: "rare"
        },
        currentyear: {
            id: "currentyear",
            name: "Current Year Nod",
            description: "A nod to the current year",
            rarity: "rare"
        },
        caitlin: {
            id: "caitlin",
            name: "Caitlin's birthday",
            description: "The inspiration was born at this time.",
            rarity: "legendary"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "It's a wonderful day for PI",
            rarity: "rare"
        },
        scooter: {
            id: "scooter",
            name: "Retro scooter",
            description: "Retro scooter",
            rarity: "rare"
        },
        seveneleven: {
            id: "seveneleven",
            name: "7-Eleven",
            description: "Thank heaven for this corner store",
            rarity: "common"
        },
        shakespeare: {
            id: "shakespeare",
            name: "Shakespeare FTW!",
            description: "Shakespeare FTW!",
            rarity: "rare"
        },
        youknow: {
            id: "youknow",
            name: "You know if you know",
            description: "You know if you know",
            rarity: "rare"
        },
        martydeparts: {
            id: "martydeparts",
            name: "Marty McFly leaves for the future",
            description: "Marty McFly leaves for the future",
            rarity: "legendary"
        },
        martyarrives: {
            id: "martyarrives",
            name: "Marty McFly arrives in the future",
            description: "Marty McFly arrives in the future",
            rarity: "legendary"
        },
        notfound: {
            id: "notfound",
            name: "The page that couldn't be found",
            description: "The page that couldn't be found",
            rarity: "rare"
        },
        hacker: {
            id: "hacker",
            name: "You speak hacker",
            description: "You speak hacker",
            rarity: "legendary"
        },
        jumbo: {
            id: "jumbo",
            name: "Jumbo",
            description: "The Jumbo Jet",
            rarity: "rare"
        },
        sixseven: {
            id: "sixseven",
            name: "¯\\_(ツ)_/¯",
            description: "Siiiiix seeeeven?",
            rarity: "rare"
        },
        seattle: {
            id: "seattle",
            name: "Rain City got its name",
            description: "Rain City got its name",
            rarity: "legendary"
        }
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});