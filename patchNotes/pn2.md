# Patch Notes 7/9/19

## Additions

#### !list can be toggled public with a cooldown or mod-only
- Mods can toggle `!list` to be public with a cooldown (defaults to 20 seconds) with `!listmode public` or `!listmode mod`.
- `!listmode` by itself simply displays the current mode.
- You can display the cooldown with `!listcooldown` or change it with `!listcooldown <seconds>`.
- For example `!listcooldown 5` would change the cooldown to 5 seconds.
- Mods aren't affected by the cooldown.
- Floskeee only receives a whisper for the list when she or a mod calls `!list`.

#### Users can skip themselves with !skipme
- `!skipme` moves the requesting user to the end of the line.

#### Users can be moved with !move
- `!move <user> <location>` will move a user to the specified place in line.
- EX: `!move floskeee 5` will move her to 5th place in line.
- If the location is greater than the length of the line, they will be place at the end of the line.

## Fixes/Adjustments

#### !setlimit displays publically rather than whisper if successfully changed

#### !drop can be given multiple users
- `!drop <player>...` drops all given players. Chats successes and whispers failures.
- Example: `!drop floskeee gimmedafruitsnacks` will drop both players from the queue. If one of the names are spelled wrong or not in the queue the bot will whisper the failed names to you.

#### !skip can be given multiple users
- `!skip <player>...` moves players to the end of the line in the given order. Chats successes and whispers failures.
- Example: `!skip floskeee gimmedafruitsnacks` moves floskee to the back first then gimmedafruitsnacks after. Any misspelled or nonexistant names will be whispered to you.
