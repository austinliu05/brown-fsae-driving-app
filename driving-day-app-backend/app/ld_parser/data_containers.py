import datetime
import struct
import numpy as np
import pandas as pd
from .file_utils import decode_string, read_channels, read_ldfile


class ldData(object):
    """Class to represent and manage ld file data including header and channels."""
    
    def __init__(self, head, channs):
        """
        Initialize ldData object with header and channels.

        Args:
            head: The header data for the ld file.
            channs: A list of channel data for the ld file.
        """
        self.head = head
        self.channs = channs

    def __getitem__(self, item):
        """
        Retrieve channel data by index or name.

        Args:
            item (int or str): The index or name of the channel.

        Raises:
            Exception: If the channel is not found by the provided name.

        Returns:
            Channel data corresponding to the provided index or name.
        """
        if not isinstance(item, int):
            col = [n for n, x in enumerate(self.channs) if x.name == item]
            if len(col) != 1:
                raise Exception("Could get column", item, col)
            item = col[0]
        return self.channs[item]

    def __iter__(self):
        """
        Iterator over the channel names.

        Returns:
            Iterator: An iterator over the names of the channels.
        """
        return iter([x.name for x in self.channs])

    def to_dataframe(self):
        """
        Convert ldData to a pandas DataFrame.

        Returns:
            DataFrame: A pandas DataFrame containing the channel data.
        """
        data_dict = {}
        lengths = {}
        
        for chann in self.channs:
            try:
                chann_data = chann.data
                if chann_data is not None:
                    data_dict[chann.name] = chann_data.tolist() if isinstance(chann_data, np.ndarray) else chann_data
                    lengths[chann.name] = len(data_dict[chann.name])
            except Exception as e:
                print(f"Error parsing {chann.name}: {e}")
        
        # Group data by unique lengths
        grouped_data = {}
        for key, value in data_dict.items():
            grouped_data.setdefault(len(value), {})[key] = value
        
        # Create DataFrames for each unique length
        return {length: pd.DataFrame(group) for length, group in grouped_data.items()}

    @classmethod
    def fromfile(cls, f):
        """
        Create an ldData object from a file.

        Args:
            f: A file object representing the ld file.

        Returns:
            ldData: An ldData object initialized with data from the file.
        """
        return cls(*read_ldfile(f))


class ldEvent(object):
    """Class to represent an event within an ld file."""
    
    fmt = '<64s64s1024sH'

    def __init__(self, name, session, comment, venue_ptr, venue):
        """
        Initialize ldEvent object.

        Args:
            name (str): Name of the event.
            session (str): Session information for the event.
            comment (str): Comment associated with the event.
            venue_ptr (int): Pointer to the venue information.
            venue (ldVenue): The venue associated with the event.
        """
        self.name, self.session, self.comment, self.venue_ptr, self.venue = \
            name, session, comment, venue_ptr, venue

    @classmethod
    def fromfile(cls, f):
        """
        Parse and create an ldEvent object from a file.

        Args:
            f: A file object representing the ld file.

        Returns:
            ldEvent: An ldEvent object with the parsed event data.
        """
        name, session, comment, venue_ptr = struct.unpack(
            ldEvent.fmt, f.read(struct.calcsize(ldEvent.fmt)))
        name, session, comment = map(decode_string, [name, session, comment])

        venue = None
        if venue_ptr > 0:
            f.seek(venue_ptr)
            venue = ldVenue.fromfile(f)

        return cls(name, session, comment, venue_ptr, venue)


class ldVenue(object):
    """Class to represent a venue within an ld file."""
    
    fmt = '<64s1034xH'

    def __init__(self, name, vehicle_ptr, vehicle):
        """
        Initialize ldVenue object.

        Args:
            name (str): Name of the venue.
            vehicle_ptr (int): Pointer to vehicle data.
            vehicle (ldVehicle): Vehicle data associated with the venue.
        """
        self.name, self.vehicle_ptr, self.vehicle = name, vehicle_ptr, vehicle

    @classmethod
    def fromfile(cls, f):
        """
        Parse and create an ldVenue object from a file.

        Args:
            f: A file object representing the ld file.

        Returns:
            ldVenue: An ldVenue object with the parsed venue data.
        """
        name, vehicle_ptr = struct.unpack(
            ldVenue.fmt, f.read(struct.calcsize(ldVenue.fmt)))

        vehicle = None
        if vehicle_ptr > 0:
            f.seek(vehicle_ptr)
            vehicle = ldVehicle.fromfile(f)
        return cls(decode_string(name), vehicle_ptr, vehicle)


class ldHead(object):
    """Class to represent the header of an ld file."""
    
    fmt = '<' + (
        "I4x"     # ldmarker
        "II"      # chann_meta_ptr chann_data_ptr
        "20x"     # ??
        "I"       # event_ptr
        "24x"     # ??
        "HHH"     # unknown static (?) numbers
        "I"       # device serial
        "8s"      # device type
        "H"       # device version
        "H"       # unknown static (?) number
        "I"       # num_channs
        "4x"      # ??
        "16s"     # date
        "16x"     # ??
        "16s"     # time
        "16x"     # ??
        "64s"     # driver
        "64s"     # vehicleid
        "64x"     # ??
        "64s"     # venue
        "64x"     # ??
        "1024x"   # ??
        "I"       # enable "pro logging" (some magic number?)
        "66x"     # ??
        "64s"     # short comment
        "126x"    # ??
    )

    def __init__(self, meta_ptr, data_ptr, event_ptr, event, driver, vehicleid, venue, datetime, short_comment):
        """
        Initialize ldHead object.

        Args:
            meta_ptr (int): Pointer to metadata.
            data_ptr (int): Pointer to data.
            event_ptr (int): Pointer to event.
            event (ldEvent): The event associated with the ld file.
            driver (str): The driver information.
            vehicleid (str): The vehicle ID.
            venue (str): The venue information.
            datetime (datetime): The datetime of the log.
            short_comment (str): A short comment associated with the log.
        """
        self.meta_ptr, self.data_ptr, self.event_ptr, self.event, self.driver, self.vehicleid, \
            self.venue, self.datetime, self.short_comment = meta_ptr, data_ptr, event_ptr, event, \
            driver, vehicleid, venue, datetime, short_comment

    @classmethod
    def fromfile(cls, f):
        """
        Parse and create an ldHead object from a file.

        Args:
            f: A file object representing the ld file.

        Returns:
            ldHead: An ldHead object with the parsed header data.
        """
        (_, meta_ptr, data_ptr, event_ptr,
            _, _, _,
            _, _, _, _, n,
            date, time,
            driver, vehicleid, venue,
            _, short_comment) = struct.unpack(ldHead.fmt, f.read(struct.calcsize(ldHead.fmt)))
        date, time, driver, vehicleid, venue, short_comment = \
            map(decode_string, [date, time, driver,
                vehicleid, venue, short_comment])

        try:
            # First, try to decode datetime with seconds
            _datetime = datetime.datetime.strptime(
                '%s %s' % (date, time), '%d/%m/%Y %H:%M:%S')
        except ValueError:
            _datetime = datetime.datetime.strptime(
                '%s %s' % (date, time), '%d/%m/%Y %H:%M')

        event = None
        if event_ptr > 0:
            f.seek(event_ptr)
            event = ldEvent.fromfile(f)
        return cls(meta_ptr, data_ptr, event_ptr, event, driver, vehicleid, venue, _datetime, short_comment)

class ldChan(object):
    """Class to represent a channel within an ld file, storing meta and data information.

    This class handles the parsing and retrieval of channel-specific metadata
    and actual data values from a binary ld file. Channel data is accessed on-demand
    via the data property.
    """

    fmt = '<' + (
        "IIII"    # prev_addr, next_addr, data_ptr, n_data
        "H"       # some counter?
        "HHH"     # datatype, datatype, rec_freq
        "hhhh"    # shift, mul, scale, dec_places
        "32s"     # name
        "8s"      # short name
        "12s"     # unit
        "40x"     # reserved bytes (40 for ACC, 32 for acti)
    )

    def __init__(self, _f, meta_ptr, prev_meta_ptr, next_meta_ptr, data_ptr, data_len,
                 dtype, freq, shift, mul, scale, dec, name, short_name, unit):
        """
        Initialize an ldChan object with the given metadata.

        Args:
            _f (str): The filename of the ld file to read from.
            meta_ptr (int): Pointer to the channel's metadata within the ld file.
            prev_meta_ptr (int): Pointer to the previous channel's metadata (if any).
            next_meta_ptr (int): Pointer to the next channel's metadata (if any).
            data_ptr (int): Pointer to the actual channel data within the ld file.
            data_len (int): Number of data points in the channel.
            dtype (type): The data type of the channel values (e.g., np.float32).
            freq (int): The recording frequency of the channel.
            shift (float): Shift value applied to the data.
            mul (float): Multiplication factor applied to the data.
            scale (float): Scaling factor applied to the data.
            dec (int): Number of decimal places in the data.
            name (str): The full name of the channel.
            short_name (str): A short version of the channel's name.
            unit (str): The unit of measurement for the channel data.
        """
        self._f = _f
        self.meta_ptr = meta_ptr
        self._data = None

        (self.prev_meta_ptr, self.next_meta_ptr, self.data_ptr, self.data_len,
         self.dtype, self.freq, self.shift, self.mul, self.scale, self.dec,
         self.name, self.short_name, self.unit) = (
            prev_meta_ptr, next_meta_ptr, data_ptr, data_len,
            dtype, freq, shift, mul, scale, dec,
            name, short_name, unit
        )

    @classmethod
    def fromfile(cls, _f, meta_ptr):
        """
        Parse and create an ldChan object from the ld file.

        Args:
            _f (str): The filename of the ld file to read from.
            meta_ptr (int): Pointer to the channel's metadata in the ld file.

        Returns:
            ldChan: An initialized ldChan object with the parsed metadata.
        """
        with open(_f, 'rb') as f:
            f.seek(meta_ptr)
            (prev_meta_ptr, next_meta_ptr, data_ptr, data_len, _,
             dtype_a, dtype, freq, shift, mul, scale, dec,
             name, short_name, unit) = struct.unpack(
                ldChan.fmt, f.read(struct.calcsize(ldChan.fmt))
            )

        name, short_name, unit = map(decode_string, [name, short_name, unit])

        def safe_get(lst, idx):
            """Safely get an element from a list, or return None if out of bounds."""
            if idx < 0 or idx >= len(lst):
                return None
            return lst[idx]

        if dtype_a in [0x07]:
            dtype = safe_get([None, np.float16, None, np.float32], dtype - 1)
        elif dtype_a in [0, 0x03, 0x05]:
            dtype = safe_get([None, np.int16, None, np.int32], dtype - 1)
        else:
            dtype = None

        return cls(_f, meta_ptr, prev_meta_ptr, next_meta_ptr, data_ptr, data_len,
                   dtype, freq, shift, mul, scale, dec, name, short_name, unit)

    @property
    def data(self):
        """
        Retrieve the channel data as a numpy array.

        This property reads the data from the ld file on demand, applies scaling,
        shifting, and multiplication factors, and returns the processed data.

        Raises:
            ValueError: If the channel's data type is unknown or if not all data points
                        are successfully read.

        Returns:
            np.array: The processed data points of the channel.
        """
        if self.dtype is None:
            raise ValueError(f'Channel {self.name} has unknown data type')

        if self._data is None:
            # Jump to the data section and read the channel's data
            with open(self._f, 'rb') as f:
                f.seek(self.data_ptr)
                try:
                    self._data = np.fromfile(
                        f, count=self.data_len, dtype=self.dtype
                    )

                    # Apply scaling, shifting, and multiplication
                    self._data = (self._data / self.scale *
                                  pow(10., -self.dec) + self.shift) * self.mul

                    if len(self._data) != self.data_len:
                        raise ValueError("Not all data read!")

                except ValueError as v:
                    print(v, self.name, self.freq,
                          hex(self.data_ptr), hex(self.data_len),
                          hex(len(self._data)), hex(f.tell()))

        return self._data