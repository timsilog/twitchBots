# Patch Notes 6/12/19

## Additions

#### Whispers enabled!
- Mods can whisper commands to Botskeee now. The bot still responds in the chat as normal. Some mod-only commands whisper back instead of responding in the chat now.

#### Public, Follower, and Sub modes enabled for queue bot
- type `!join public` `!join follower` or `!join sub`
- Follower mode by default

#### Mass add
- Need to clear the queue and rebuild it? Add more than one user with `!massadd`
- EG: `!massadd floskeee gimmedafruitsnacks ninja`
- It will whisper back to you which users were successfully added and which failed.

#### Enable Auto-list
- `!autolist` calls `!list` automatically every 10 minutes. Calling it against disables it.
- `!autolist n` calls `!list` every `n` minutes. (E.G. `!autolist 5` is every 5 minutes). 
- `!autolist-interval` just changes the interval.

#### Enable Reminders
- The bot will remind the chat to follow or chat periodically

```
Talking in the chat will help Flo remember who you are. She likes it when everyone interacts with each other.
```

```
ATTENTION: If you have not FOLLOWED yet, PLEASE DO :) Floskeee would be so happy <3 Thank you!
```

- type `!remind` to enable or disable (it toggles)
- type `!remind-interval n` to set how frequently it reminds every `n` minutes (default: 20 mins)
- type `!remind restart` to simply restart it (in case you change the interval)

## Fixes/Adjustments

#### !list whispers to Floskeee now
- `!list` only displays twitch usernames now unless you type `!list true`.
- Every time `!list` is called, it also whispers the list to Floskeee (with the fortnite names).
- Floskeee is NOT whispered to from calls from `!autolist`.

#### !drop works the same as !next now
- You can type `!drop` without a username following and it'll remove the front of the line just like `!next`

#### Some verbosity adjustments
- `!spot` will say if someone isn't in the queue.
- `!next` will say who got dropped.
- `!join` will tell the person who joined which spot in line they're in.
