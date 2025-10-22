def decode_string(bytes):
    """
    Decodes a byte string to a clean ASCII string.

    Args:
        bytes (bytes): The byte string to decode.

    Returns:
        str: The decoded ASCII string, with extra spaces and null characters removed.
             If decoding fails, an empty string is returned.
             
    Raises:
        Exception: If the byte string cannot be decoded, an error message is printed.
    """
    try:
        return bytes.decode('ascii').strip().rstrip('\0').strip()
    except Exception as e:
        print(f"Could not decode string: {e} - {bytes}")
        return ""


def read_channels(f_, meta_ptr):
    """
    Reads and parses all channel data from the file starting from a given metadata pointer.

    Args:
        f_ (str): The file path of the ld file to read from.
        meta_ptr (int): The pointer to the start of the channel metadata block.

    Returns:
        list: A list of `ldChan` objects representing the channels in the file.

    Raises:
        ImportError: If the `ldChan` class cannot be imported from the `data_containers` module.
    """    
    chans = []
    while meta_ptr:
        from .data_containers import ldChan  # Import inside function to avoid circular import issues
        chan_ = ldChan.fromfile(f_, meta_ptr)  # Parse a single channel
        chans.append(chan_)
        meta_ptr = chan_.next_meta_ptr  # Move to the next channel's metadata
    return chans


def read_ldfile(f_):
    """
    Reads the contents of an ld file and extracts its header and channel data.

    Args:
        f_ (str): The file path of the ld file to read.

    Returns:
        tuple: A tuple containing:
            - `ldHead`: The header object containing metadata.
            - `list`: A list of `ldChan` objects representing the channels.

    Raises:
        ImportError: If the `ldHead` class cannot be imported from the `data_containers` module.
        FileNotFoundError: If the specified file path is invalid.
    """    
    from .data_containers import ldHead  # Import inside function to avoid circular import issues
    head_ = ldHead.fromfile(open(f_, 'rb'))  # Parse the header
    chans = read_channels(f_, head_.meta_ptr)  # Read the channels using the header metadata pointer
    return head_, chans