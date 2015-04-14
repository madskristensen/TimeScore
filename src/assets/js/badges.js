var Badges = (function () {

    function getBadges() {

        var badges = [];

        for (var badge in allBadges) {

            if (localStorage["badge:" + allBadges[badge].id])
            badges.push(allBadges[badge]);
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

        localStorage["badge:" + b] = localStorage["badge:" + b] ? parseInt(localStorage["badge:" + b]) + 1 : 1;
    }

    var allBadges = {
        appreciate: {
            id: "appreciate",
            name: "Who do we appreciate",
            description: "Who do we appreciate"
        },
        beer: {
            id: "beer",
            name: "Beer o'clock",
            description: "That time of day again"
        },
        caitlin: {
            id: "caitlin",
            name: "Caitlin's birthday",
            description: "Caitlin was born on this time of day."
        },
        denmark: {
            id: "denmark",
            name: "Kingdom of Denmark",
            description: "Kingdom of Denmark"
        },
        ellendun: {
            id: "ellendun",
            name: "Battle of Ellendun",
            description: "Battle of Ellendun"
        },
        emily: {
            id: "emily",
            name: "Emily's birthday",
            description: "Emily's birthday"
        },
        pi: {
            id: "pi",
            name: "Wonderful day for PI",
            description: "Wonderful day for PI",
        },
        prime: {
            id: "prime",
            name: "Optimus Prime",
            description: "Optimus Prime",
        },
        redsea: {
            id: "redsea",
            name: "What color is the sea?",
            description: "What color is the sea?",
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
            description: "Shakespeare FTW!"
        },
    }

    return {
        badges: allBadges,
        getBadges: getBadges,
        addBadge: addBadge,
    }
});