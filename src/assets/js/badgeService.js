var BadgeService = (function () {

    var prefix = "badge:";

    function readCount(id) {
        try {
            return parseInt(localStorage.getItem(prefix + id), 10) || 0;
        }
        catch (e) {
            return 0;
        }
    }

    // Earned badges, each with `count` (times earned).
    function getBadges() {
        var badges = [];

        for (var id in allBadges) {
            var count = readCount(id);

            if (count > 0) {
                badges.push(Object.assign({}, allBadges[id], { count: count }));
            }
        }

        return badges;
    }

    // Every badge, earned or not, in display order (tiers, then moments).
    function getAllBadges() {
        var list = [];

        for (var id in allBadges) {
            list.push(Object.assign({}, allBadges[id], { count: readCount(id) }));
        }

        return list;
    }

    // Returns { badge, isNew, count } or null when nothing was recorded.
    function addBadge(badge) {
        if (!badge || window.testmode)
            return null;

        var existing = readCount(badge.id);

        if (badge.type === "single" && existing > 0)
            return null;

        var count = existing + 1;
        try {
            localStorage.setItem(prefix + badge.id, String(count));
        }
        catch (e) {
            return null;
        }

        return { badge: badge, isNew: existing === 0, count: count };
    }

    var tiers = [
        { min: 1, id: "newbie" },
        { min: 10, id: "adventurer" },
        { min: 50, id: "timetraveller" },
        { min: 100, id: "timebandit" },
        { min: 500, id: "timelord" },
        { min: 1000, id: "timegamer" }
    ];

    // Awards every score tier crossed by `weeklyPoints` (not just the highest).
    function awardTiers(weeklyPoints) {
        var awarded = [];

        for (var i = 0; i < tiers.length; i++) {
            if (weeklyPoints >= tiers[i].min) {
                var result = addBadge(allBadges[tiers[i].id]);
                if (result && result.isNew)
                    awarded.push(result);
            }
        }

        return awarded;
    }

    var allBadges = {
        newbie: { id: "newbie", icon: "🐣", name: "Newbie", description: "Congrats!! You got your first point", type: "single", rarity: "common" },
        adventurer: { id: "adventurer", icon: "🧭", name: "Adventurer", description: "Congrats!! That's your first 10 points", type: "single", rarity: "common" },
        timetraveller: { id: "timetraveller", icon: "🚀", name: "Time traveller", description: "You're a Time Traveller! That's 50 points", type: "single", rarity: "rare" },
        timebandit: { id: "timebandit", icon: "🦹", name: "Time Bandit", description: "Time Bandit got 100 points in one week", type: "single", rarity: "rare" },
        timelord: { id: "timelord", icon: "🌀", name: "Time Lord", description: "500 points in one week. You are a Time Lord!!", type: "single", rarity: "legendary" },
        timegamer: { id: "timegamer", icon: "👑", name: "Time gamer", description: "1000 points in one week. You are a Time Gamer!!", type: "single", rarity: "legendary" },

        midnight: { id: "midnight", icon: "🌑", name: "Midnight", description: "A fresh day starts now", rarity: "legendary" },
        noon: { id: "noon", icon: "☀️", name: "Noon", description: "Midday on the dot", rarity: "common" },
        counting: { id: "counting", icon: "🔢", name: "Counting Sequence", description: "1:23 and rolling", rarity: "rare" },
        twofoursixeight: { id: "twofoursixeight", icon: "📣", name: "2-4-6-8", description: "Who do we appreciate", rarity: "rare" },
        twentyfourseven: { id: "twentyfourseven", icon: "🏪", name: "We're open 24 hours a day", description: "24/7 never sleeps", rarity: "rare" },
        pi: { id: "pi", icon: "🥧", name: "Wonderful day for PI", description: "It's a wonderful day for PI", rarity: "rare" },
        notfound: { id: "notfound", icon: "🔍", name: "The page that couldn't be found", description: "The page that couldn't be found", rarity: "rare" },
        caitlin: { id: "caitlin", icon: "🎂", name: "Caitlin's birthday", description: "The inspiration was born at this time.", rarity: "legendary" },
        sixseven: { id: "sixseven", icon: "🤷", name: "¯\\_(ツ)_/¯", description: "Siiiiix seeeeven?", rarity: "rare" },
        seveneleven: { id: "seveneleven", icon: "🏬", name: "7-Eleven", description: "Thank heaven for this corner store", rarity: "common" },
        jumbo: { id: "jumbo", icon: "✈️", name: "Jumbo", description: "The Jumbo Jet", rarity: "rare" },
        lucky: { id: "lucky", icon: "🍀", name: "Lucky Time", description: "08:08 brings lucky vibes", rarity: "rare" },
        emergency: { id: "emergency", icon: "🚨", name: "It's an emergency", description: "9:11 - It's an emergency", rarity: "rare" },
        keynote: { id: "keynote", icon: "📱", name: "Keynote Time", description: "A familiar product demo timestamp", rarity: "rare" },
        scooter: { id: "scooter", icon: "🛵", name: "Retro scooter", description: "Retro scooter", rarity: "rare" },
        watchface: { id: "watchface", icon: "⌚", name: "Watch Face Time", description: "The classic display time", rarity: "common" },
        shakespeare: { id: "shakespeare", icon: "🎭", name: "Shakespeare FTW!", description: "Shakespeare FTW!", rarity: "rare" },
        makeawish: { id: "makeawish", icon: "🌠", name: "Make-a-Wish", description: "Catch the wish time", rarity: "rare" },
        martydeparts: { id: "martydeparts", icon: "⚡", name: "Marty McFly leaves for the future", description: "Marty McFly leaves for the future", rarity: "legendary" },
        hacker: { id: "hacker", icon: "💻", name: "You speak hacker", description: "You speak hacker", rarity: "legendary" },
        scottishdentist: { id: "scottishdentist", icon: "🦷", name: "Scottish dentist appointment", description: "Scottish dentist appointment", rarity: "legendary" },
        fourtwenty: { id: "fourtwenty", icon: "🌿", name: "420", description: "A very recognizable time", rarity: "common" },
        martyarrives: { id: "martyarrives", icon: "🚗", name: "Marty McFly arrives in the future", description: "Marty McFly arrives in the future", rarity: "legendary" },
        beer: { id: "beer", icon: "🍺", name: "Beer o'clock", description: "Beer o'clock", rarity: "common" },
        seattle: { id: "seattle", icon: "🌧️", name: "Rain City got its name", description: "Rain City got its name", rarity: "legendary" },
        currentyear: { id: "currentyear", icon: "📅", name: "Current Year Nod", description: "A nod to the current year", rarity: "rare" }
    };

    return {
        badges: allBadges,
        getBadges: getBadges,
        getAllBadges: getAllBadges,
        addBadge: addBadge,
        awardTiers: awardTiers
    };
});
