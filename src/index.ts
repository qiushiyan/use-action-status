"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "pending" | "delayed" | "done" | "error";
type Options = {
	delayTimeout?: number;
};

const defaultOptions: Options = {
	delayTimeout: undefined,
};

export const useActionStatus = <TArgs extends any[], TReturn>(
	f: (...args: TArgs) => Promise<TReturn>,
	options?: Partial<Options>,
) => {
	const opts = { ...defaultOptions, ...options };
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<Error | null>(null);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const promiseRef = useRef<Promise<TReturn> | null>(null);
	const resolveRef = useRef<
		((value: TReturn | PromiseLike<TReturn>) => void) | null
	>(null);
	const rejectRef = useRef<((reason?: any) => void) | null>(null);

	const clearTimeoutRef = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	};

	const isPending = status === "pending" || status === "delayed";
	const isDelayed = status === "delayed";
	const isError = status === "error";
	const isSuccess = status === "done";

	useEffect(() => {
		return () => {
			clearTimeoutRef();
			if (rejectRef.current) {
				rejectRef.current("unmount");
			}
		};
	}, []);

	const action = useCallback(
		async (...args: TArgs): Promise<TReturn> => {
			if (rejectRef.current) {
				// debounce
				rejectRef.current("cancel_pending");
			}

			clearTimeoutRef();

			promiseRef.current = new Promise<TReturn>((resolve, reject) => {
				resolveRef.current = resolve;
				rejectRef.current = reject;
			});

			setStatus("pending");
			setError(null);

			if (opts.delayTimeout) {
				timeoutRef.current = setTimeout(
					() => setStatus("delayed"),
					opts.delayTimeout,
				);
			}

			try {
				const val = await f(...args);
				setStatus("done");
				resolveRef.current?.(val);
			} catch (err) {
				setStatus("error");
				setError(err as Error);
				rejectRef.current?.(err);
			} finally {
				clearTimeoutRef();
			}

			return promiseRef.current;
		},
		[f, opts],
	);

	return { status, error, isPending, isDelayed, isError, isSuccess, action };
};
