Server send HTML to client => client request data to /api/data/settings => client do action =>
```typescript
sendData.mutate({
  action: "change_home_page_register_robotstxt_toggles",
  data: statusSystemPull,
});
```

from statusSystemPull to
```json
{
  homePage: statusSystemPull.homePage,
  registration: statusSystemPull.registration,
  robotsTxt: checked
}
```
