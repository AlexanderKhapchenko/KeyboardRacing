export class SymbolInfo {
    get(name) {
        return `А вот ${name} до конца гонки на расстоянии уже менее 30ти символов`;
    }
}

export type TSymbolInfo = InstanceType<typeof SymbolInfo>;