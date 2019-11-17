package net.gnehzr.tnoodle.util;

import java.util.function.Supplier;

public class LazySupplier<T> implements Supplier<T> {
    private final Supplier<T> originalSupplier;

    public LazySupplier(Supplier<T> supply) {
        this.originalSupplier = supply;
    }

    private T cache = null;

    @Override
    public T get() {
        if (this.cache == null) {
            this.cache = originalSupplier.get();
        }

        return this.cache;
    }
}
