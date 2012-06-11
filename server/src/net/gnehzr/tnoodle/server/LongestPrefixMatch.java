package net.gnehzr.tnoodle.server;

import java.util.ArrayList;
import java.util.Arrays;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

public class LongestPrefixMatch<K> {
	public LongestPrefixMatch() {
		// TODO - implement something fast!
	}
	
	private ArrayList<K[]> keys = new ArrayList<K[]>();
	public void put(K[] key) {
		azzert(!keys.contains(key));
		keys.add(key);
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
	
	public K[] get(K[] path) {
		K[] longestMatch = null;
		for(int i = 0; i < keys.size(); i++) {
			K[] key = keys.get(i);
			if((longestMatch == null || key.length > longestMatch.length) && pathMatchesKey(path, key)) {
				longestMatch = key;
			}
		}
		return longestMatch;
	}
	
	public void clear() {
		keys.clear();
	}
	
	@Override
	public String toString() {
		String s = "";
		for(K[] key : keys) {
			s += Arrays.toString(key) + ", ";
		}
		s = "[ " + s + " ]";
		return super.toString() + " " + s;
	}
}
