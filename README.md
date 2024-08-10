# websockets-track
UI to display plane tracks from a time-independent datasource

## todo
- [ ] get live data from prometheus
- [ ] get time window data from prometheus (time window range from client)
- [x] animate plane track movement (interpolate)
- [ ] animate plane track text (https://learn.svelte.dev/tutorial/key-blocks)
- [x] add multiple update channels in backend
- [ ] fit tracks to screen (check on clientside if OOB, then dont render)
- [ ] add track deletion messages to clients
- [ ] oh god how am I gonna make maps
- [ ] per id requests (with http) for historic data to draw tracks
- [ ] per person requests (with http) [later]