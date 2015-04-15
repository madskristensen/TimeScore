var Badges = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {
            var points = localStorage["badge:" + allBadges[badge].id];

            if (points) {
                var b = parseInt(points, 10)
                var thisBadge = allBadges[badge]
                thisBadge.level = Math.floor(points / 5);
                badges.push(thisBadge);
            }
        }

        return badges;
    }

    function addBadge(name) {
        var b = null;

        for (var badge in allBadges) {
            if (badge === name || allBadges[badge] === name) {
                b = badge;
                break;
            }
        }

        if (allBadges[b].type === "single" && localStorage["badge:" + b])
            return;

        localStorage["badge:" + b] = (localStorage["badge:" + b] ? parseInt(localStorage["badge:" + b], 10) : 1);
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
            id: "Time traveller",
            name: "Adventurer",
            description: "Congrats!! That's your first 50 points",
            type: "single"
        },
        timelord: {
            id: "timelord",
            name: "Time Lord",
            description: "Congrats!! That's your first 100 points",
            type: "single"
        },

        appreciate: {
            id: "appreciate",
            name: "Who do we appreciate",
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
            description: "Caitlin was born on this time of day."
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
        emily: {
            id: "emily",
            name: "Emily's birthday",
            description: "Emily was born on this time of day"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "It's a wonderful day for PI",
        },
        prime: {
            id: "prime",
            name: "Optimus Prime",
            description: "Gotta love them prime numbers",
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
            description: "you know if you know"
        },
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});