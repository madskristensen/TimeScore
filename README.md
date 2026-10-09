## Game The Time - because not all time is equal

Play it at [gamethetime.fun](https://gamethetime.fun). It works offline and can be installed to your home screen.

Game The Time gives you an instant answer to one of the universe's oldest questions:

**How many points is time worth right now?**

Keep the page open, and every minute that matches a rule scores points, keeps your streak alive,
fills your collection and can unlock badges.

#### The rules

Rules are judged on the 12-hour clock face (`h:mm`, hours 1-12), so most patterns score twice a day,
AM and PM. Some special moments (like 13:37, 16:20 or midnight) only exist once a day.
A minute can match several rules, and the points add up.

| Points | Rule | Example |
|-------:|------|---------|
| 9 | **Royal Straight Flush** - a four-digit straight | 12:34 |
| 7 | **Special moment in time** - a famous time, each with its own badge | 3:14, 7:11, 11:11, 13:37 |
| 6 | **Today in time** - the hour is the month and the minute is the day | 10:08 on October 8 |
| 5 | **Three strikes and you're in** - three of a kind | 2:22, 5:55 |
| 5 | **A run in time** - three digits in a row, up or down | 2:34, 3:21 |
| 4 | **Pete : Repeat** - hour and minute are the same | 10:10, 12:12 |
| 3 | **A couple of couples** - two pairs | 11:22 |
| 3 | **Top of the hour** | 4:00 |
| 2 | **Double digit divide** - 10-12 o'clock and the minute divides by the hour | 10:30, 12:36 |
| 2 | **Nothing but primes** - every digit is 2, 3, 5 or 7 | 2:37 |
| 1 | **Minute sums it up** - the minute digits add up to the hour | 4:13 |
| 1 | **Mirror, mirror on the wall** - a palindrome | 1:01, 12:21 |

#### Progress

- **Last 24h / Last 7 days** - rolling point totals.
- **Streak** - every calendar day with at least one point. You get one streak save a week.
- **Daily challenge** - a new challenge every day, with your last 7 results.
- **Collection** - every scoring time of day you have ever caught (AM and PM count separately).
- **Badges** - common, rare and legendary badges for special moments and weekly point tiers.

Everything is stored locally in your browser.

#### Development

It's a static site with no build step: serve `src/` with any web server
(for example `python3 -m http.server` from `src/`) and open `/test/` to run the QUnit tests.
When you release, bump `VERSION` in `src/service-worker.js` so installed apps pick up the update.
