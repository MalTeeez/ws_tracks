# websockets-track
UI to display plane tracks from a time-independent datasource

## todo
- [x] get live data from prometheus
- [ ] get time window data from prometheus (time window range from client)
- [x] animate plane track movement (interpolate)
- [ ] animate plane track text (https://learn.svelte.dev/tutorial/key-blocks)
- [x] add multiple update channels in backend
- [x] fit tracks to screen (check on clientside if OOB, then dont render)
- [ ] add track deletion messages to clients
- [x] oh god how am I gonna make maps (i made maps)
- [ ] figure out a way to display tracks relative to the current map position (max & min of lat & lon?)
- [ ] per id requests (with http) for historic data to draw track line & get more info
- [ ] per person requests (with http) [later]
- [x] transmit updates in binary
- [ ] keep track moving on longer than update rate wait times with expected speed
- [x] get page tree layout working without absolute
- [ ] design track popup window, and fill with http req
- [ ] create a packet framework, to allow different binary packets