import { useEffect, useState } from 'react'


export function useFetch<T>(fn: () => Promise<any>, deps: any[] = []) {
const [data, setData] = useState<T | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)


useEffect(() => {
let mounted = true
setLoading(true)
fn()
.then(res => mounted && setData(res.data.data))
.catch(err => mounted && setError(err.message))
.finally(() => mounted && setLoading(false))
return () => {
mounted = false
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, deps)


return { data, loading, error }
}