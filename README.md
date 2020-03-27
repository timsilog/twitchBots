# Botskeee
 
## --- PUBLIC COMMANDS ---
- `!status`: Check if the queue is open.
- `!join <username?>`: Join the queue. `username` is required for the first time, then no longer needed every time after. Calling `!join <username>` otherwise updates your Fortnite name in the database. `username` needs to be their Fortnite name, not their Epic Games name.
- `!dropme`: Remove yourself from the list.
- `!skipme`: Move yourself to the end of the line.
- `!spot`: See where you are in line.
 
## --- MOD-ONLY COMMANDS ---

Mods can call any command either in the chat or by whispering Botskeee. It is recommended to whisper commands that the chat doesn't necessarilly need to see such as `!remind`. Try some of the commands while Floskeee is off-stream to test them out.

### - Queue Commands -
- `!open`: Open the queue.
- `!close`: Close the queue.
- `!list`: See the current queue.
- `!current`: Tell the chat who's next in line.
- `!next`: Remove the person in the front of the line.
- `!skip <twitchname?>...`: Move the front of the line to the back. If any number of twitch names are provided, they are moved to the back of the line in the given order instead.
- `!add <twitchname> <n?>`: Adds a twitch user to position `n` in line. If a number isn't provided then the user is added to the back of the line. User must already exist in the database, otherwise use `!store`.
- `!store <twitchname> <ign>`: Adds/edits a twitch user with the specified in-game name to the database (but not the queue, use `!add`).
- `!drop <twitchname?>...`: Removes all specified users from the list or the front of the list if none provided.
- `!move <twitchname> <n>`: Moves a user in line to `n`th place in line. Moves them to the back if `n` is greater than the length of the line.
- `!listmode <public?|mod?>`: Displays the current list mode. Sets the list to be public or mod-only if provided. 
- `!listcooldown <n?>`: Displays the current list cooldown for public mode (default 20 seconds). If `n` is provided, sets the cooldown to `n` seconds.
- `!remind`: Enable bot to remind the chat to follow (default every 20 mins). Call again to disable. Call `!remind restart` to restart it.
- `!autolist <n?>`: Calls `!list` every `n` minutes (default is 10 mins). Call again to disable.
- `!massadd <user> <user>...`: Adds all provided twitch users to the queue. Whispers back successes and fails. E.G. `!massadd floskeee gimmedafruitsnacks ninja`
 
### - Queue Settings -
- `!mode <mode>`: Set the current mode for queue.
  - `!mode public`: Anybody can join.
  - `!mode follower`: Followers only can join. (DEFAULT)
  - `!mode sub`: Subscribers only can join.
- `!verbose`: Toggle whether the bot responds to everything or not
- `!limit`: See the current queue size limit (default 10).
- `!setlimit <n>`: Set the queue size limit to `n`.
- `!remind-interval <n?>`: Set number of minutes between reminders to `n`. Just prints the current interval if `n` isn't provided.
- `!autolist-interval <n?>`: Set number of minutes between `!list` calls to `n`. Just prints the current interval if `n` isn't provided.

