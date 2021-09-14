"""
Contains a collection of useful functions when working
with strings.
"""


def shorten_to(string: str, length: int, extension: bool = False):
    """
    When a user uploaded a plugin with a pretty long file/URL name,
    it is useful to crop this file name to avoid weird UI behavior.
    This method takes a string (in this example the file name) and
    shortens it to the given length.

    If your string is a URL or link name,
    it will be cut to the given length and '...' will be appended indicating
    that this string has been shortened.

    If your string is a file name, only the middle part will be replaced
    by '...', so that the user is able to see the file extension of the
    file they are about to download.

    :param string:      The string to shorten.
    :param length:      The length to shorten the string to.
    :param extension:   Whether this string represents a file name that
                        contains a file extension. In this case, the file
                        extension won't be cropped so that the user can
                        see which file they are about to download.
    :return: The shortened string ("SuperNicePlugin.jar" -> 'Super...in.jar')
    """
    if len(string) > length:
        if extension:
            ext = string.split(".")[-1]
            str_only = ".".join(string.split(".")[0:-1])
            parts_len = round((length - 3 - len(ext)) / 2)
            return f"{str_only[0:parts_len]}...{str_only[-parts_len:]}.{ext}"
        return f"{string[0:length-3]}..."
    return string
