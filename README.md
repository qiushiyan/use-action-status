# use-action-status

A React hook for monitoring the status of any async operation.

## Examples

```tsx
const [response, setResponse] = useState(null);

const { action, isPending, isDelayed, isError, error } = useActionStatus(
  async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    setResponse(await res.json());

    // or any other async code
  },
  { delayTimeout: 3000 }
);

return (
  <div>
    <button onClick={action}>Fetch</button>
    {isPending && <p>Loading...</p>}

    {isError && <p>Error: {error.message}</p>}
    {isDelayed && <p>This request took longer than usual</p>}
    {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
  </div>
);
```
