export const addSerial = (dataArray: any[], page: number, page_size: number) => {
    if (dataArray?.length) {
        let arrayAfterSerial = dataArray.map((item: {}, index: number) => {
            return { ...item, serial: (page - 1) * page_size + (index + 1) };
        });
        return arrayAfterSerial;
    }
    return [];
};
export const addDataSerial = (dataArray: any[]) => {
    if (dataArray?.length) {
        let arrayAfterSerial = dataArray.map((item: {}, index: number) => {
            return { ...item, serial: +(index + 1) };
        });
        return arrayAfterSerial;
    }
    return [];
};
