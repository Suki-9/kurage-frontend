type nullable<T> = T | nullish;
type nullish = null | undefined;
type falsy = nullish | false;
type Values<T> = T[keyof T];
