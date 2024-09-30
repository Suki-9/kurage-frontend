type nullable<T> = T | nullish;
type nullish = null | undefined;
type falsy = nullish | false | -0 | 0n | '';
type Values<T> = T[keyof T];
