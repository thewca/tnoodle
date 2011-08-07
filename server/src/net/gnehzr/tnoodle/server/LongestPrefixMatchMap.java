package net.gnehzr.tnoodle.server;

import java.util.ArrayList;

public class LongestPrefixMatchMap<K, V> {
	public LongestPrefixMatchMap() {
		// TODO - implement something fast!
	}
	
	private ArrayList<K[]> keys = new ArrayList<K[]>();
	private ArrayList<V> vals = new ArrayList<V>();
	public void put(K[] key, V val) {
		assert !keys.contains(key);
		keys.add(key);
		vals.add(val);
	}
	
	private boolean pathMatchesKey(K[] path, K[] key) {
		if(key.length > path.length) {
			return false;
		}
		for(int i = 0; i < key.length; i++) {
			if(!key[i].equals(path[i])) {
				return false;
			}
		}
		return true;
	}
	
	public V get(K[] path) {
		V bestMatch = null;
		int bestMatchKeyLen = -1;
		for(int i = 0; i < keys.size(); i++) {
			K[] key = keys.get(i);
			if(key.length > bestMatchKeyLen && pathMatchesKey(path, key)) {
				bestMatchKeyLen = key.length;
				bestMatch = vals.get(i);
			}
		}
		return bestMatch;
	}
	
	public void clear() {
		keys.clear();
		vals.clear();
	}
}
